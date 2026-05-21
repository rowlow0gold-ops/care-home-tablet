//! care-home-tablet Tauri shell.
//!
//! Intentionally minimal. The frontend talks directly to care-home-server over
//! HTTPS — we only need Tauri for: persistent encrypted storage (device token),
//! native shell on iOS/Android/desktop, and future offline sync.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|_app| Ok(()))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
