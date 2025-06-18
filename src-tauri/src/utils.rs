use serde::{Deserialize, Serialize};

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

pub fn get_app_data_dir() -> Result<std::path::PathBuf, String> {
    tauri::api::path::app_data_dir(&tauri::Config::default())
        .ok_or_else(|| "Failed to get app data directory".to_string())
}
