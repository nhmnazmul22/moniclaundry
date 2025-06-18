use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

pub fn create_menu() -> Menu {
    let new_order = CustomMenuItem::new("new_order".to_string(), "New Order")
        .accelerator("CmdOrCtrl+N");
    let print_receipt = CustomMenuItem::new("print_receipt".to_string(), "Print Receipt")
        .accelerator("CmdOrCtrl+P");
    let quit = CustomMenuItem::new("quit".to_string(), "Exit")
        .accelerator("CmdOrCtrl+Q");

    let file_menu = Submenu::new(
        "File",
        Menu::new()
            .add_item(new_order)
            .add_item(print_receipt)
            .add_native_item(MenuItem::Separator)
            .add_item(quit),
    );

    let dashboard = CustomMenuItem::new("dashboard".to_string(), "Dashboard")
        .accelerator("CmdOrCtrl+1");
    let orders = CustomMenuItem::new("orders".to_string(), "Orders")
        .accelerator("CmdOrCtrl+2");
    let customers = CustomMenuItem::new("customers".to_string(), "Customers")
        .accelerator("CmdOrCtrl+3");
    let reload = CustomMenuItem::new("reload".to_string(), "Reload")
        .accelerator("CmdOrCtrl+R");
    let dev_tools = CustomMenuItem::new("dev_tools".to_string(), "Toggle Developer Tools")
        .accelerator("F12");

    let view_menu = Submenu::new(
        "View",
        Menu::new()
            .add_item(dashboard)
            .add_item(orders)
            .add_item(customers)
            .add_native_item(MenuItem::Separator)
            .add_item(reload)
            .add_item(dev_tools),
    );

    let backup_database = CustomMenuItem::new("backup_database".to_string(), "Backup Database");
    let settings = CustomMenuItem::new("settings".to_string(), "Settings")
        .accelerator("CmdOrCtrl+,");

    let tools_menu = Submenu::new(
        "Tools",
        Menu::new()
            .add_item(backup_database)
            .add_item(settings),
    );

    let about = CustomMenuItem::new("about".to_string(), "About Monic Laundry POS");
    let help_menu = Submenu::new("Help", Menu::new().add_item(about));

    Menu::new()
        .add_submenu(file_menu)
        .add_submenu(view_menu)
        .add_submenu(tools_menu)
        .add_submenu(help_menu)
}
