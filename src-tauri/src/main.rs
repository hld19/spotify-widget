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

fn create_success_page() -> String {
    r#"
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Spotify Authentication - Success</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #1DB954 0%, #1ed760 50%, #1aa34a 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .container {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                padding: 48px 40px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                max-width: 480px;
                width: 100%;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 24px;
                background: linear-gradient(135deg, #1DB954, #1ed760);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: pulse 2s infinite;
            }
            
            .icon svg {
                width: 40px;
                height: 40px;
                fill: white;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            h1 {
                font-size: 28px;
                font-weight: 700;
                color: #191414;
                margin-bottom: 16px;
                line-height: 1.2;
            }
            
            p {
                font-size: 16px;
                color: #666;
                margin-bottom: 32px;
                line-height: 1.5;
            }
            
            .action-button {
                background: linear-gradient(135deg, #1DB954, #1ed760);
                color: white;
                border: none;
                padding: 14px 32px;
                border-radius: 50px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
                margin-bottom: 16px;
            }
            
            .action-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(29, 185, 84, 0.3);
            }
            
            .secondary-text {
                font-size: 14px;
                color: #999;
                margin-top: 24px;
            }
            
            .spotify-logo {
                width: 24px;
                height: 24px;
                margin-right: 8px;
                vertical-align: middle;
            }
            
            @media (max-width: 480px) {
                .container {
                    padding: 32px 24px;
                }
                
                h1 {
                    font-size: 24px;
                }
                
                .icon {
                    width: 64px;
                    height: 64px;
                }
                
                .icon svg {
                    width: 32px;
                    height: 32px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">
                <svg viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
            </div>
            
            <h1> Authentication Successful!</h1>
            <p>ur widget works</p>
            
            <button class="action-button" onclick="window.close()">
                <svg class="spotify-logo" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.062 14.615c-.179 0-.294-.086-.355-.172-.708-.81-1.557-1.035-2.707-.977-1.018.051-2.03.273-3.02.605-.153.051-.256.102-.41.102-.409 0-.716-.307-.716-.716 0-.409.256-.665.614-.767 1.122-.358 2.276-.614 3.464-.665 1.327-.064 2.583.204 3.669 1.122.204.179.307.358.307.665 0 .409-.307.716-.716.716-.051 0-.102 0-.128-.051zm.921-2.276c-.204 0-.358-.102-.46-.204-.863-.969-2.073-1.327-3.336-1.225-1.173.077-2.327.332-3.464.716-.204.077-.307.128-.512.128-.512 0-.895-.384-.895-.895 0-.46.281-.767.665-.895 1.301-.435 2.634-.742 4.019-.819 1.634-.09 3.17.256 4.506 1.378.281.23.409.512.409.844 0 .512-.384.895-.895.895-.026 0-.026 0-.037-.023zm1.122-2.583c-.23 0-.409-.077-.537-.23-1.071-1.173-2.634-1.634-4.198-1.506-1.378.102-2.737.409-4.045.895-.23.102-.383.153-.614.153-.614 0-1.071-.46-1.071-1.071 0-.537.307-.895.742-1.071 1.505-.537 3.062-.895 4.659-1.02 1.916-.128 3.781.332 5.388 1.71.332.281.486.614.486.998 0 .614-.46 1.071-1.071 1.071-.051 0-.077 0-.102-.026-.051.051-.051.051-.051.051-.307.23-.486.307-.537.307z"/>
                </svg>
                Close Window
            </button>
            
            <div class="secondary-text">
                You can now return to your Spotify widget and enjoy your music! 🎧
            </div>
        </div>
        
        <script>
            // Auto-close after 5 seconds
            setTimeout(() => {
                window.close();
            }, 5000);
        </script>
    </body>
    </html>
    "#.to_string()
}

fn create_error_page(error_message: &str) -> String {
    format!(r#"
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Spotify Authentication - Error</title>
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }}
            
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 50%, #d63447 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }}
            
            .container {{
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                padding: 48px 40px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                max-width: 480px;
                width: 100%;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }}
            
            .icon {{
                width: 80px;
                height: 80px;
                margin: 0 auto 24px;
                background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: shake 0.5s ease-in-out;
            }}
            
            .icon svg {{
                width: 40px;
                height: 40px;
                fill: white;
            }}
            
            @keyframes shake {{
                0%, 100% {{ transform: translateX(0); }}
                25% {{ transform: translateX(-5px); }}
                75% {{ transform: translateX(5px); }}
            }}
            
            h1 {{
                font-size: 28px;
                font-weight: 700;
                color: #191414;
                margin-bottom: 16px;
                line-height: 1.2;
            }}
            
            p {{
                font-size: 16px;
                color: #666;
                margin-bottom: 32px;
                line-height: 1.5;
            }}
            
            .action-button {{
                background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                color: white;
                border: none;
                padding: 14px 32px;
                border-radius: 50px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
                margin-right: 12px;
                margin-bottom: 16px;
            }}
            
            .action-button:hover {{
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(255, 107, 107, 0.3);
            }}
            
            .secondary-button {{
                background: transparent;
                color: #666;
                border: 2px solid #ddd;
                padding: 12px 24px;
                border-radius: 50px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
                margin-bottom: 16px;
            }}
            
            .secondary-button:hover {{
                border-color: #999;
                color: #333;
            }}
            
            .error-details {{
                background: rgba(255, 107, 107, 0.1);
                border: 1px solid rgba(255, 107, 107, 0.3);
                border-radius: 12px;
                padding: 16px;
                margin-top: 24px;
                font-size: 14px;
                color: #d63447;
            }}
            
            @media (max-width: 480px) {{
                .container {{
                    padding: 32px 24px;
                }}
                
                h1 {{
                    font-size: 24px;
                }}
                
                .icon {{
                    width: 64px;
                    height: 64px;
                }}
                
                .icon svg {{
                    width: 32px;
                    height: 32px;
                }}
                
                .action-button, .secondary-button {{
                    display: block;
                    width: 100%;
                    margin-right: 0;
                    margin-bottom: 12px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">
                <svg viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
            </div>
            
            <h1>🚫 Authentication Failed</h1>
            <p>We encountered an issue while connecting your Spotify account. Please try again.</p>
            
            <button class="action-button" onclick="window.close()">
                Close Window
            </button>
            <button class="secondary-button" onclick="window.history.back()">
                Try Again
            </button>
            
            <div class="error-details">
                <strong>Error Details:</strong><br>
                {}
            </div>
        </div>
    </body>
    </html>
    "#, error_message)
}

type OAuthClient = BasicClient;

struct AppState {
    client: Option<OAuthClient>,
    pkce_verifier: Option<String>,
    csrf_token: Option<String>,
}

#[tauri::command]
async fn select_music_directory() -> Result<Option<String>, String> {
    println!("Directory selection requested - user should manually enter path");
    Ok(None)
}

#[tauri::command]
async fn resize_window_for_tabs(app_handle: AppHandle, show_tabs: bool, compact_mode: Option<bool>) -> Result<(), String> {
    use tauri::LogicalSize;
    
    if let Some(window) = app_handle.get_webview_window("main") {
        let (width, height) = if show_tabs {
            
            (600, 400)
        } else {
            let is_compact = compact_mode.unwrap_or(true);
            if is_compact {
                (500, 100)
            } else {
                (550, 250)
            }
        };
        
        match window.set_size(LogicalSize::new(width, height)) {
            Ok(_) => {
                println!("Window resized to {}x{} (tabs: {})", width, height, show_tabs);

                let min_size = if show_tabs {
                    LogicalSize::new(500, 350)
                } else {
                    LogicalSize::new(400, 100)
                };
                
                if let Err(e) = window.set_min_size(Some(min_size)) {
                    eprintln!("Failed to set minimum size: {}", e);
                }
                
                Ok(())
            }
            Err(e) => {
                eprintln!("Failed to resize window: {}", e);
                Err(e.to_string())
            }
        }
    } else {
        Err("Could not find main window".to_string())
    }
}

#[tauri::command]
async fn find_local_album_art(
    artist: String,
    album: String,
    track: String,
    music_directory: Option<String>,
) -> Result<Option<String>, String> {
    use std::path::PathBuf;
    
    println!("Searching for album art: {} - {} - {}", artist, album, track);
    
    
    let music_dirs = if let Some(custom_dir) = music_directory {
        vec![PathBuf::from(custom_dir)]
    } else if cfg!(target_os = "windows") {
        vec![
            dirs::audio_dir().unwrap_or_else(|| PathBuf::from("C:\\Users\\Public\\Music")),
            dirs::document_dir().map(|d| d.join("Music")).unwrap_or_else(|| PathBuf::from("C:\\Users\\Public\\Documents\\Music")),
        ]
    } else {
        vec![
            dirs::audio_dir().unwrap_or_else(|| PathBuf::from("~/Music")),
            dirs::document_dir().map(|d| d.join("Music")).unwrap_or_else(|| PathBuf::from("~/Documents/Music")),
        ]
    };
    
    
    let album_jpg = format!("{}.jpg", album);
    let album_png = format!("{}.png", album);
    let album_jpeg = format!("{}.jpeg", album);
    
    let art_filenames = vec![
        "folder.jpg", "folder.png", "folder.jpeg",
        "cover.jpg", "cover.png", "cover.jpeg",
        "album.jpg", "album.png", "album.jpeg",
        "albumart.jpg", "albumart.png", "albumart.jpeg",
        "front.jpg", "front.png", "front.jpeg",
        &album_jpg,
        &album_png,
        &album_jpeg,
    ];
    
    
    for music_dir in music_dirs {
        if !music_dir.exists() {
            continue;
        }
        
        let search_paths = vec![
            music_dir.join(&artist).join(&album),
            music_dir.join(format!("{} - {}", artist, album)),
            music_dir.join(&album),
            music_dir.join(&artist),
        ];
        
        for search_path in search_paths {
            if !search_path.exists() {
                continue;
            }
            
            for filename in &art_filenames {
                let art_path = search_path.join(filename);
                if art_path.exists() {
                    println!("Found album art: {}", art_path.display());
                    
                    return Ok(Some(format!("file://{}", art_path.display())));
                }
            }
        }
    }
    
    println!("No album art found for: {} - {}", artist, album);
    Ok(None)
}

#[tauri::command]
async fn login(client_id: String, state: tauri::State<'_, Arc<tokio::sync::Mutex<AppState>>>) -> Result<(), String> {
    let mut state = state.inner().lock().await;

    // Create OAuth client with the provided client ID
    let redirect_url = "http://127.0.0.1:14700/callback";
    let auth_url = AuthUrl::new("https://accounts.spotify.com/authorize".to_string())
        .expect("Invalid auth URL");
    let token_url = Some(TokenUrl::new("https://accounts.spotify.com/api/token".to_string())
        .expect("Invalid token URL"));

    let client = BasicClient::new(
        ClientId::new(client_id),
        None,
        auth_url,
        token_url,
    )
    .set_redirect_uri(RedirectUrl::new(redirect_url.to_string())
        .expect("Invalid redirect URL"));

    let (pkce_challenge, pkce_verifier) = PkceCodeChallenge::new_random_sha256();
    state.pkce_verifier = Some(pkce_verifier.secret().to_string());

    let (auth_url, csrf_token) = client
        .authorize_url(CsrfToken::new_random)
        .set_pkce_challenge(pkce_challenge)
        .add_scope(Scope::new("user-read-currently-playing".to_string()))
        .add_scope(Scope::new("user-read-playback-state".to_string()))
        .add_scope(Scope::new("user-modify-playback-state".to_string()))
        .add_scope(Scope::new("user-read-recently-played".to_string()))
        .url();

    state.csrf_token = Some(csrf_token.secret().to_string());
    state.client = Some(client);

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
            return Html(create_error_page("Security error: Invalid request state."));
        }
        app_state.pkce_verifier.take().unwrap()
    };

    let token_result = {
        let app_state = state.app_state.lock().await;
        if let Some(ref client) = app_state.client {
            client
        .exchange_code(AuthorizationCode::new(query.code))
        .set_pkce_verifier(oauth2::PkceCodeVerifier::new(pkce_verifier))
        .request_async(async_http_client)
                .await
        } else {
            return Html(create_error_page("OAuth client not initialized."));
        }
    };

    match token_result {
        Ok(token) => {
            println!("OAuth token exchange successful");
            if let Err(e) = state.app_handle.emit("spotify-auth-token", &token) {
                eprintln!("Failed to emit token: {}", e);
            }
            Html(create_success_page())
        }
        Err(e) => {
            eprintln!("Token exchange failed: {}", e);
            Html(create_error_page("Authentication failed. Please try again."))
        }
    }
}

async fn refresh_token(
    State(state): State<AxumState>,
    Json(payload): Json<RefreshTokenRequest>,
) -> impl IntoResponse {
    println!("Refreshing OAuth token");
    
    let token_result = {
        let app_state = state.app_state.lock().await;
        if let Some(ref client) = app_state.client {
            client
                .exchange_refresh_token(&RefreshToken::new(payload.refresh_token))
                .request_async(async_http_client)
                .await
        } else {
            return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, 
                   Html(create_error_page("OAuth client not initialized."))).into_response();
        }
    };

    match token_result {
        Ok(token) => {
            println!("Token refresh successful");
            (axum::http::StatusCode::OK, Json(token)).into_response()
        }
        Err(e) => {
            eprintln!("Token refresh failed: {}", e);
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, 
             Html(create_error_page("Failed to refresh authentication token."))).into_response()
        }
    }
}

fn main() {
 
    println!("Starting Spotify Widget...");
    
    // We'll create the OAuth client dynamically when login is called
    let state = Arc::new(tokio::sync::Mutex::new(AppState {
        client: None,
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
            

            if let Err(e) = window.set_decorations(false) {
                eprintln!("Failed to set window decorations: {}", e);
            }
            
            
            if let Err(e) = window.show() {
                eprintln!("Failed to show window: {}", e);
            }
            
            if let Err(e) = window.center() {
                eprintln!("Failed to center window: {}", e);
            }

           
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
        .invoke_handler(tauri::generate_handler![login, find_local_album_art, select_music_directory, resize_window_for_tabs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
