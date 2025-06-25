use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Serialize, Deserialize)]
pub struct AppConfig {
    pub database_url: String,
    pub app_name: String,
    pub version: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            database_url: "".to_string(),
            app_name: "Monic Laundry POS".to_string(),
            version: "1.0.0".to_string(),
        }
    }
}

#[allow(dead_code)]
pub async fn get_app_data_dir(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))
}
