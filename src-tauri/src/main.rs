// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rand::{thread_rng, Rng};
use sha2::{Sha256, Digest};
use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
use tauri::{WindowEvent, Manager};

#[tauri::command]
fn generate_code_verifier() -> String {
    let mut rng = thread_rng();
    let verifier_bytes: Vec<u8> = (0..32).map(|_| rng.gen_range(33..126)).collect();
    URL_SAFE_NO_PAD.encode(verifier_bytes)
}

#[tauri::command]
fn generate_code_challenge(verifier: String) -> String {
    let mut hasher = Sha256::new();
    hasher.update(verifier.as_bytes());
    let result = hasher.finalize();
    URL_SAFE_NO_PAD.encode(result)
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Set up deep link handler
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_deep_link::init())?;
            
            // Listen for window events
            let window = app.get_webview_window("main").unwrap();
            window.clone().on_window_event(move |event| {
                let window = window.clone();
                match event {
                    WindowEvent::CloseRequested { api, .. } => {
                        // Hide window instead of closing
                        api.prevent_close();
                        window.hide().unwrap();
                    }
                    _ => {}
                }
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            generate_code_verifier,
            generate_code_challenge,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
