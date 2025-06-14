// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use axum::{
    extract::{Query, State},
    response::{Html, IntoResponse},
    routing::get,
    Router,
};
use oauth2::{
    basic::BasicClient, reqwest::async_http_client, AuthUrl, AuthorizationCode, ClientId,
    CsrfToken, PkceCodeChallenge, RedirectUrl, Scope, TokenResponse, TokenUrl,
};
use serde::Deserialize;
use std::{net::SocketAddr, sync::Arc};
use tauri::{AppHandle, Emitter};

// The client ID and secret from the Spotify dashboard.
const CLIENT_ID: &str = "0d719dbb994743bc9a8af7a7d0b4f3f1";

type OAuthClient = BasicClient;

struct AppState {
    client: OAuthClient,
    pkce_verifier: Option<String>,
    csrf_token: Option<String>,
}

#[tauri::command]
async fn login(state: tauri::State<'_, Arc<tokio::sync::Mutex<AppState>>>) -> Result<(), String> {
    let mut state = state.inner().lock().await;

    let (pkce_challenge, pkce_verifier) = PkceCodeChallenge::new_random_sha256();
    state.pkce_verifier = Some(pkce_verifier.secret().to_string());

    let (auth_url, csrf_token) = state
        .client
        .authorize_url(CsrfToken::new_random)
        .set_pkce_challenge(pkce_challenge)
        .add_scope(Scope::new("user-read-currently-playing".to_string()))
        .add_scope(Scope::new("user-read-playback-state".to_string()))
        .add_scope(Scope::new("user-modify-playback-state".to_string()))
        .url();

    state.csrf_token = Some(csrf_token.secret().to_string());

    open::that(auth_url.to_string()).map_err(|e| e.to_string())?;

    Ok(())
}

#[derive(Deserialize)]
struct AuthRequest {
    code: String,
    state: String,
}

#[derive(Clone)]
struct AxumState {
    app_state: Arc<tokio::sync::Mutex<AppState>>,
    app_handle: AppHandle,
}

async fn callback(
    State(state): State<AxumState>,
    Query(query): Query<AuthRequest>,
) -> impl IntoResponse {
    let pkce_verifier = {
        let mut app_state = state.app_state.lock().await;
        if Some(query.state) != app_state.csrf_token.take() {
            return Html("<h1>CSRF token mismatch!</h1>".to_string());
        }
        app_state.pkce_verifier.take().unwrap()
    };

    let token = state
        .app_state
        .lock()
        .await
        .client
        .exchange_code(AuthorizationCode::new(query.code))
        .set_pkce_verifier(oauth2::PkceCodeVerifier::new(pkce_verifier))
        .request_async(async_http_client)
        .await;

    if let Ok(token) = token {
        state
            .app_handle
            .emit("spotify-auth-token", &token)
            .expect("failed to emit token");
    }

    Html("<h1>Authentication successful! You can close this window now.</h1>".to_string())
}

fn main() {
    let redirect_url = "http://127.0.0.1:14700/callback";
    let auth_url = AuthUrl::new("https://accounts.spotify.com/authorize".to_string()).unwrap();
    let token_url = Some(TokenUrl::new("https://accounts.spotify.com/api/token".to_string()).unwrap());

    let client = BasicClient::new(
        ClientId::new(CLIENT_ID.to_string()),
        None,
        auth_url,
        token_url,
    )
    .set_redirect_uri(RedirectUrl::new(redirect_url.to_string()).unwrap());

    let state = Arc::new(tokio::sync::Mutex::new(AppState {
        client,
        pkce_verifier: None,
        csrf_token: None,
    }));

    let state_clone = state.clone();

    tauri::Builder::default()
        .setup(move |app| {
            let app_handle = app.handle().clone();
            let axum_state = AxumState {
                app_state: state_clone,
                app_handle,
            };

            tauri::async_runtime::spawn(async move {
                let router = Router::new()
                    .route("/callback", get(callback))
                    .with_state(axum_state);

                let addr = SocketAddr::from(([127, 0, 0, 1], 14700));
                axum::Server::bind(&addr)
                    .serve(router.into_make_service())
                    .await
                    .unwrap();
            });
            Ok(())
        })
        .manage(state)
        .invoke_handler(tauri::generate_handler![login])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
