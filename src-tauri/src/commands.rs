use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{command, Window};

#[derive(Serialize, Deserialize)]
pub struct ReceiptData {
    pub order_number: String,
    pub date: String,
    pub customer_name: String,
    pub items: Vec<ReceiptItem>,
    pub total: f64,
    pub estimated_completion: String,
}

#[derive(Serialize, Deserialize)]
pub struct ReceiptItem {
    pub service: String,
    pub weight: f64,
    pub price: f64,
    pub subtotal: f64,
}

#[derive(Serialize, Deserialize)]
pub struct DialogOptions {
    pub title: Option<String>,
    pub message: String,
    pub dialog_type: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct SaveDialogOptions {
    pub title: Option<String>,
    pub default_path: Option<String>,
    pub filters: Option<Vec<FileFilter>>,
}

#[derive(Serialize, Deserialize)]
pub struct FileFilter {
    pub name: String,
    pub extensions: Vec<String>,
}

#[command]
pub async fn get_app_version() -> Result<String, String> {
    Ok("1.0.0".to_string())
}

#[command]
pub async fn show_message_dialog(
    window: Window,
    options: DialogOptions,
) -> Result<bool, String> {
    let result = tauri::api::dialog::blocking::message(
        Some(&window),
        &options.title.unwrap_or_else(|| "Message".to_string()),
        &options.message,
    );
    Ok(true)
}

#[command]
pub async fn show_save_dialog(
    window: Window,
    options: SaveDialogOptions,
) -> Result<Option<String>, String> {
    let mut dialog_builder = tauri::api::dialog::FileDialogBuilder::new();
    
    if let Some(title) = options.title {
        dialog_builder = dialog_builder.set_title(&title);
    }
    
    if let Some(default_path) = options.default_path {
        dialog_builder = dialog_builder.set_file_name(&default_path);
    }
    
    if let Some(filters) = options.filters {
        for filter in filters {
            dialog_builder = dialog_builder.add_filter(&filter.name, &filter.extensions);
        }
    }
    
    let result = dialog_builder.save_file();
    Ok(result.map(|path| path.to_string_lossy().to_string()))
}

#[command]
pub async fn show_open_dialog(
    window: Window,
    options: SaveDialogOptions,
) -> Result<Option<Vec<String>>, String> {
    let mut dialog_builder = tauri::api::dialog::FileDialogBuilder::new();
    
    if let Some(title) = options.title {
        dialog_builder = dialog_builder.set_title(&title);
    }
    
    if let Some(filters) = options.filters {
        for filter in filters {
            dialog_builder = dialog_builder.add_filter(&filter.name, &filter.extensions);
        }
    }
    
    let result = dialog_builder.pick_files();
    Ok(result.map(|paths| {
        paths.into_iter()
            .map(|path| path.to_string_lossy().to_string())
            .collect()
    }))
}

#[command]
pub async fn print_receipt(receipt_data: ReceiptData) -> Result<bool, String> {
    crate::print::print_receipt_pdf(receipt_data).await
}

#[command]
pub async fn backup_database(file_path: String) -> Result<bool, String> {
    // Implement database backup logic here
    // This would typically involve connecting to your database and exporting data
    Ok(true)
}

#[command]
pub async fn restore_database(file_path: String) -> Result<bool, String> {
    // Implement database restore logic here
    Ok(true)
}

#[command]
pub async fn get_system_info() -> Result<HashMap<String, String>, String> {
    let mut info = HashMap::new();
    info.insert("platform".to_string(), std::env::consts::OS.to_string());
    info.insert("arch".to_string(), std::env::consts::ARCH.to_string());
    Ok(info)
}

#[command]
pub async fn navigate_to(window: Window, path: String) -> Result<(), String> {
    window.emit("navigate", path).map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
pub async fn create_receipt_pdf(receipt_data: ReceiptData) -> Result<String, String> {
    crate::print::create_receipt_pdf(receipt_data).await
}
