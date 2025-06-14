// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use axum::{
    extract::{Query, State},
    response::{Html, IntoResponse},
    routing::get,
    Router,
};
use oauth2::{
    reqwest::async_http_client, AuthUrl, AuthorizationCode, ClientId, CsrfToken, PkceCodeChallenge,
    RedirectUrl, Scope, TokenResponse, TokenUrl,
};
use serde::Deserialize;
use std::{net::SocketAddr, sync::Arc};
use tauri::{AppHandle, Manager};

// The client ID and secret from the Spotify dashboard.
const CLIENT_ID: &str = "0d719dbb994743bc9a8af7a7d0b4f3f1";

type OAuthClient = oauth2::Client<
    oauth2::StandardErrorResponse<oauth2::basic::BasicErrorResponseType>,
    oauth2::StandardTokenResponse<oauth2::EmptyExtraTokenFields, oauth2::basic::BasicTokenType>,
    oauth2::basic::BasicTokenType,
    oauth2::StandardTokenRevocationError,
    oauth2::StandardRevocationsErrorResponse<oauth2::basic::BasicErrorResponseType>,
>;

struct AppState {
    client: OAuthClient,
    pkce_verifier: Option<String>,
    csrf_token: Option<CsrfToken>,
}

#[derive(Deserialize)]
struct AuthRequest {
    code: AuthorizationCode,
    state: CsrfToken,
}

#[tauri::command]
async fn login(app_handle: AppHandle) -> Result<(), String> {
    let (pkce_challenge, pkce_verifier) = PkceCodeChallenge::new_random_sha256();

    let (auth_url, _csrf_token) = {
        let state_gaurd = app_handle.state::<Arc<tokio::sync::Mutex<AppState>>>();
        let mut state = state_gaurd.lock().await;

        state.pkce_verifier = Some(pkce_verifier.secret().clone());
        state.csrf_token = Some(CsrfToken::new_random());

        let (auth_url, csrf_token) = state
            .client
            .authorize_url(|| state.csrf_token.as_ref().unwrap().clone())
            .add_scope(Scope::new("user-read-currently-playing".to_string()))
            .add_scope(Scope::new("user-read-playback-state".to_string()))
            .add_scope(Scope::new("user-modify-playback-state".to_string()))
            .set_pkce_challenge(pkce_challenge)
            .url();
        (auth_url, csrf_token)
    };

    open::that(auth_url.to_string()).map_err(|e| e.to_string())?;

    Ok(())
}

async fn callback(
    Query(query): Query<AuthRequest>,
    State(state): State<Arc<tokio::sync::Mutex<AppState>>>,
    State(app_handle): State<AppHandle>,
) -> impl IntoResponse {
    let pkce_verifier = {
        let mut state = state.lock().await;
        let csrf_valid = state
            .csrf_token
            .as_ref()
            .map_or(false, |t| t.secret() == query.state.secret());

        if !csrf_valid {
            return Html("<h1>CSRF validation failed.</h1>".to_string());
        }
        state.pkce_verifier.take()
    };

    if let Some(pkce_verifier) = pkce_verifier {
        let client = {
            let state = state.lock().await;
            state.client.clone()
        };
        let token_result = client
            .exchange_code(query.code)
            .set_pkce_verifier(oauth2::PkceCodeVerifier::new(pkce_verifier))
            .request_async(async_http_client)
            .await;

        if let Ok(token) = token_result {
            app_handle
                .emit("spotify-auth-token", token)
                .expect("Failed to emit event");
            return Html("<h1>Authentication successful! You can close this window now.</h1>".to_string());
        }
    }

    Html("<h1>Authentication failed.</h1>".to_string())
}

fn main() {
    let auth_url = AuthUrl::new("https://accounts.spotify.com/authorize".to_string()).unwrap();
    let token_url = TokenUrl::new("https://accounts.spotify.com/api/token".to_string()).unwrap();

    let redirect_url = "http://localhost:14700/callback";

    let client = OAuthClient::new(
        ClientId::new(CLIENT_ID.to_string()),
        None,
        auth_url,
        Some(token_url),
    )
    .set_redirect_uri(RedirectUrl::new(redirect_url.to_string()).unwrap());

    let state = Arc::new(tokio::sync::Mutex::new(AppState {
        client,
        pkce_verifier: None,
        csrf_token: None,
    }));

    tauri::Builder::default()
        .setup(move |app| {
            let app_handle = app.handle().clone();
            let state_clone = state.clone();

            tauri::async_runtime::spawn(async move {
                let router = Router::new()
                    .route("/callback", get(callback))
                    .with_state(state_clone)
                    .with_state(app_handle);

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