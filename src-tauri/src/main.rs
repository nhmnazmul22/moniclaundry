#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{
    CustomMenuItem, Manager, Menu, MenuItem, Submenu, SystemTray, SystemTrayEvent,
    SystemTrayMenu, SystemTrayMenuItem, WindowBuilder, WindowUrl,
};
use std::collections::HashMap;

mod commands;
mod menu;
mod print;
mod utils;

use commands::*;

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .menu(menu::create_menu())
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    window.hide().unwrap();
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                _ => {}
            },
            _ => {}
        })
        .on_menu_event(|event| {
            match event.menu_item_id() {
                "new_order" => {
                    event.window().emit("menu-new-order", {}).unwrap();
                }
                "print_receipt" => {
                    event.window().emit("menu-print-receipt", {}).unwrap();
                }
                "dashboard" => {
                    event.window().emit("menu-navigate", "/dashboard").unwrap();
                }
                "orders" => {
                    event.window().emit("menu-navigate", "/dashboard/orders").unwrap();
                }
                "customers" => {
                    event.window().emit("menu-navigate", "/dashboard/customers").unwrap();
                }
                "settings" => {
                    event.window().emit("menu-navigate", "/dashboard/settings").unwrap();
                }
                "backup_database" => {
                    event.window().emit("menu-backup-database", {}).unwrap();
                }
                "about" => {
                    let _ = tauri::api::dialog::message(
                        Some(&event.window()),
                        "About Monic Laundry POS",
                        "Version 1.0.0\nPoint of Sale System for Laundry Business",
                    );
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_app_version,
            show_message_dialog,
            show_save_dialog,
            show_open_dialog,
            print_receipt,
            backup_database,
            restore_database,
            get_system_info,
            navigate_to,
            create_receipt_pdf
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
