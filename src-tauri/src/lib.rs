mod commands;
mod menu;
mod print;
mod utils;

use tauri::{
    Manager, WindowEvent, Emitter,
};
use tauri_plugin_dialog::{DialogExt, MessageDialogKind};

#[cfg(feature = "tray-icon")]
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{TrayIconBuilder, TrayIconEvent},
};

use commands::*;

pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Create application menu
            let menu = menu::create_menu(app)?;
            app.set_menu(menu)?;

            // Create system tray (only if tray-icon feature is enabled)
            #[cfg(feature = "tray-icon")]
            {
                let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
                let hide = MenuItemBuilder::with_id("hide", "Hide").build(app)?;
                let show = MenuItemBuilder::with_id("show", "Show").build(app)?;

                let tray_menu = MenuBuilder::new(app)
                    .item(&show)
                    .item(&hide)
                    .separator()
                    .item(&quit)
                    .build()?;

                let _tray = TrayIconBuilder::new()
                    .menu(&tray_menu)
                    .on_menu_event(|app, event| match event.id().as_ref() {
                        "quit" => {
                            app.exit(0);
                        }
                        "hide" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.hide();
                            }
                        }
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        _ => {}
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let TrayIconEvent::Click { .. } = event {
                            if let Some(app) = tray.app_handle().get_webview_window("main") {
                                let _ = app.show();
                                let _ = app.set_focus();
                            }
                        }
                    })
                    .build(app)?;
            }

            Ok(())
        })
        .on_menu_event(|app, event| {
            if let Some(window) = app.get_webview_window("main") {
                match event.id().as_ref() {
                    "new_order" => {
                        let _ = window.emit("menu-new-order", ());
                    }
                    "print_receipt" => {
                        let _ = window.emit("menu-print-receipt", ());
                    }
                    "dashboard" => {
                        let _ = window.emit("menu-navigate", "/dashboard");
                    }
                    "orders" => {
                        let _ = window.emit("menu-navigate", "/dashboard/orders");
                    }
                    "customers" => {
                        let _ = window.emit("menu-navigate", "/dashboard/customers");
                    }
                    "settings" => {
                        let _ = window.emit("menu-navigate", "/dashboard/settings");
                    }
                    "backup_database" => {
                        let _ = window.emit("menu-backup-database", ());
                    }
                    "reload" => {
                        let _ = window.eval("window.location.reload()");
                    }
                    "dev_tools" => {
                        #[cfg(debug_assertions)]
                        {
                            if window.is_devtools_open() {
                                let _ = window.close_devtools();
                            } else {
                                let _ = window.open_devtools();
                            }
                        }
                    }
                    "about" => {
                        window.dialog()
                            .message("Version 1.0.0\nPoint of Sale System for Laundry Business")
                            .title("About Monic Laundry POS")
                            .kind(MessageDialogKind::Info)
                            .show(|_| {});
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                }
            }
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // Hide the window instead of closing on close button click
                window.hide().unwrap();
                api.prevent_close();
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
        ]);

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
