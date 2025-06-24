#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use axum::{
    extract::{Query, State},
    response::{Html, IntoResponse, Json},
    routing::{get, post},
    Router,
};
use oauth2::{
    basic::BasicClient, reqwest::async_http_client, AuthUrl, AuthorizationCode, ClientId,
    CsrfToken, PkceCodeChallenge, RedirectUrl, Scope, TokenUrl, RefreshToken,
};
use serde::{Deserialize};
use std::{net::SocketAddr, sync::Arc};
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tokio::net::TcpListener;

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
        .add_scope(Scope::new("user-read-recently-played".to_string()))
        .url();

    state.csrf_token = Some(csrf_token.secret().to_string());

    match open::that(auth_url.to_string()) {
        Ok(_) => {
            println!("Opening browser for authentication: {}", auth_url);
            Ok(())
        }
        Err(e) => {
            eprintln!("Failed to open browser: {}", e);
            Err(e.to_string())
        }
    }
}

#[derive(Deserialize)]
struct AuthRequest {
    code: String,
    state: String,
}

#[derive(Deserialize)]
struct RefreshTokenRequest {
    refresh_token: String,
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
    println!("Received OAuth callback with code: {}", &query.code[..10]);
    
    let pkce_verifier = {
        let mut app_state = state.app_state.lock().await;
        if Some(query.state) != app_state.csrf_token.take() {
            eprintln!("CSRF token mismatch!");
            return Html("<h1>CSRF token mismatch!</h1>".to_string());
        }
        app_state.pkce_verifier.take().unwrap()
    };

    let token_result = state
        .app_state
        .lock()
        .await
        .client
        .exchange_code(AuthorizationCode::new(query.code))
        .set_pkce_verifier(oauth2::PkceCodeVerifier::new(pkce_verifier))
        .request_async(async_http_client)
        .await;

    match token_result {
        Ok(token) => {
            println!("OAuth token exchange successful");
            if let Err(e) = state.app_handle.emit("spotify-auth-token", &token) {
                eprintln!("Failed to emit token: {}", e);
            }
            Html("<h1>Authentication successful! You can close this window now.</h1>".to_string())
        }
        Err(e) => {
            eprintln!("Token exchange failed: {}", e);
            Html("<h1>Authentication failed.</h1>".to_string())
        }
    }
}

async fn refresh_token(
    State(state): State<AxumState>,
    Json(payload): Json<RefreshTokenRequest>,
) -> impl IntoResponse {
    println!("Refreshing OAuth token");
    
    let client = {
        let app_state = state.app_state.lock().await;
        app_state.client.clone()
    };

    let token_result = client
        .exchange_refresh_token(&RefreshToken::new(payload.refresh_token))
        .request_async(async_http_client)
        .await;

    match token_result {
        Ok(token) => {
            println!("Token refresh successful");
            (axum::http::StatusCode::OK, Json(token)).into_response()
        }
        Err(e) => {
            eprintln!("Token refresh failed: {}", e);
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, 
             Html("<h1>Failed to refresh token.</h1>".to_string())).into_response()
        }
    }
}

fn main() {
    // Initialize logging
    println!("Starting Spotify Widget...");
    
    let redirect_url = "http://127.0.0.1:14700/callback";
    let auth_url = AuthUrl::new("https://accounts.spotify.com/authorize".to_string())
        .expect("Invalid auth URL");
    let token_url = Some(TokenUrl::new("https://accounts.spotify.com/api/token".to_string())
        .expect("Invalid token URL"));

    let client = BasicClient::new(
        ClientId::new(CLIENT_ID.to_string()),
        None,
        auth_url,
        token_url,
    )
    .set_redirect_uri(RedirectUrl::new(redirect_url.to_string())
        .expect("Invalid redirect URL"));

    let state = Arc::new(tokio::sync::Mutex::new(AppState {
        client,
        pkce_verifier: None,
        csrf_token: None,
    }));

    let state_clone = state.clone();

    tauri::Builder::default()
        .setup(move |app| {
            println!("Setting up Tauri application...");
            
            let app_handle = app.handle().clone();
            let window = app.get_webview_window("main")
                .expect("Failed to get main window");
            
            // Enhanced window initialization
            if let Err(e) = window.set_decorations(false) {
                eprintln!("Failed to set window decorations: {}", e);
            }
            
            // Show and center the window
            if let Err(e) = window.show() {
                eprintln!("Failed to show window: {}", e);
            }
            
            if let Err(e) = window.center() {
                eprintln!("Failed to center window: {}", e);
            }

            // Global shortcuts with better error handling
            let shortcut_prev =
                Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::ArrowLeft);
            let shortcut_next =
                Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::ArrowRight);
            let shortcut_quit = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyQ);

            match app.handle().plugin(
                tauri_plugin_global_shortcut::Builder::new()
                    .with_handler(move |app, shortcut, event| {
                        if event.state() == ShortcutState::Pressed {
                            if shortcut == &shortcut_prev {
                                println!("Global shortcut: Previous track");
                                if let Err(e) = app.emit("skip-to-previous", ()) {
                                    eprintln!("Failed to emit skip-to-previous: {}", e);
                                }
                            } else if shortcut == &shortcut_next {
                                println!("Global shortcut: Next track");
                                if let Err(e) = app.emit("skip-to-next", ()) {
                                    eprintln!("Failed to emit skip-to-next: {}", e);
                                }
                            } else if shortcut == &shortcut_quit {
                                println!("Global shortcut: Quit");
                                if let Some(window) = app.get_webview_window("main") {
                                    if let Err(e) = window.close() {
                                        eprintln!("Failed to close window: {}", e);
                                    }
                                }
                            }
                        }
                    })
                    .build(),
            ) {
                Ok(_) => println!("Global shortcut plugin loaded successfully"),
                Err(e) => eprintln!("Failed to load global shortcut plugin: {}", e),
            }

            // Register shortcuts with error handling
            if let Err(e) = app.global_shortcut().register(shortcut_prev) {
                eprintln!("Failed to register previous shortcut: {}", e);
            }
            if let Err(e) = app.global_shortcut().register(shortcut_next) {
                eprintln!("Failed to register next shortcut: {}", e);
            }
            if let Err(e) = app.global_shortcut().register(shortcut_quit) {
                eprintln!("Failed to register quit shortcut: {}", e);
            }

            let axum_state = AxumState {
                app_state: state_clone,
                app_handle,
            };

            // Modern Axum server setup
            tauri::async_runtime::spawn(async move {
                let router = Router::new()
                    .route("/callback", get(callback))
                    .route("/refresh-token", post(refresh_token))
                    .with_state(axum_state);

                let addr = SocketAddr::from(([127, 0, 0, 1], 14700));
                println!("Starting OAuth server on {}", addr);
                
                match TcpListener::bind(&addr).await {
                    Ok(listener) => {
                        if let Err(e) = axum::serve(listener, router).await {
                            eprintln!("Server error: {}", e);
                        }
                    }
                    Err(e) => {
                        eprintln!("Failed to bind to {}: {}", addr, e);
                    }
                }
            });
            
            println!("Tauri application setup complete");
            Ok(())
        })
        .manage(state)
        .invoke_handler(tauri::generate_handler![login])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
