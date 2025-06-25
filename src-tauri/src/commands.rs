use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{command, Window};
use tauri::Emitter;
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

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
    let title = options.title.unwrap_or_else(|| "Message".to_string());
    
    window.dialog()
        .message(&options.message)
        .title(&title)
        .kind(MessageDialogKind::Info)
        .blocking_show();
    
    Ok(true)
}

#[command]
pub async fn show_save_dialog(
    window: Window,
    options: SaveDialogOptions,
) -> Result<Option<String>, String> {
    use std::sync::mpsc;
    
    let mut dialog = window.dialog().file();

    if let Some(title) = options.title {
        dialog = dialog.set_title(&title);
    }

    if let Some(default_path) = options.default_path {
        dialog = dialog.set_file_name(&default_path);
    }

    if let Some(filters) = options.filters {
        for filter in filters {
            // Convert Vec<String> to Vec<&str> for the add_filter method
            let extensions: Vec<&str> = filter.extensions.iter().map(|s| s.as_str()).collect();
            dialog = dialog.add_filter(&filter.name, &extensions);
        }
    }

    // Use a channel to get the result from the callback
    let (tx, rx) = mpsc::channel();
    
    dialog.save_file(move |result| {
        let _ = tx.send(result);
    });
    
    match rx.recv() {
        Ok(Some(path)) => Ok(Some(path.to_string().to_string())),
        Ok(None) => Ok(None),
        Err(_) => Err("Dialog operation failed".to_string()),
    }
}

#[command]
pub async fn show_open_dialog(
    window: Window,
    options: SaveDialogOptions,
) -> Result<Option<Vec<String>>, String> {
    use std::sync::mpsc;
    
    let mut dialog = window.dialog().file();

    if let Some(title) = options.title {
        dialog = dialog.set_title(&title);
    }

    if let Some(filters) = options.filters {
        for filter in filters {
            // Convert Vec<String> to Vec<&str> for the add_filter method
            let extensions: Vec<&str> = filter.extensions.iter().map(|s| s.as_str()).collect();
            dialog = dialog.add_filter(&filter.name, &extensions);
        }
    }

    // Use a channel to get the result from the callback
    let (tx, rx) = mpsc::channel();
    
    dialog.pick_files(move |result| {
        let _ = tx.send(result);
    });
    
    match rx.recv() {
        Ok(Some(paths)) => Ok(Some(
            paths
                .into_iter()
                .map(|p| p.to_string().to_string())
                .collect()
        )),
        Ok(None) => Ok(None),
        Err(_) => Err("Dialog operation failed".to_string()),
    }
}

#[command]
pub async fn print_receipt(receipt_data: ReceiptData) -> Result<bool, String> {
    crate::print::print_receipt_pdf(receipt_data).await
}

#[command]
pub async fn backup_database(_file_path: String) -> Result<bool, String> {
    // implement your backup logic
    Ok(true)
}

#[command]
pub async fn restore_database(_file_path: String) -> Result<bool, String> {
    // implement your restore logic
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
    window.emit("navigate", path).map_err(|e| e.to_string())
}

#[command]
pub async fn create_receipt_pdf(receipt_data: ReceiptData) -> Result<String, String> {
    crate::print::create_receipt_pdf(receipt_data).await
}
