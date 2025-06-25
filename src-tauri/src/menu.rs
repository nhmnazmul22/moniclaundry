use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    App, Result,
};

pub fn create_menu(app: &App) -> Result<tauri::menu::Menu<tauri::Wry>> {
    let new_order = MenuItemBuilder::with_id("new_order", "New Order")
        .accelerator("CmdOrCtrl+N")
        .build(app)?;
    let print_receipt = MenuItemBuilder::with_id("print_receipt", "Print Receipt")
        .accelerator("CmdOrCtrl+P")
        .build(app)?;
    let quit = MenuItemBuilder::with_id("quit", "Exit")
        .accelerator("CmdOrCtrl+Q")
        .build(app)?;

    let file_menu = SubmenuBuilder::new(app, "File")
        .item(&new_order)
        .item(&print_receipt)
        .separator()
        .item(&quit)
        .build()?;

    let dashboard = MenuItemBuilder::with_id("dashboard", "Dashboard")
        .accelerator("CmdOrCtrl+1")
        .build(app)?;
    let orders = MenuItemBuilder::with_id("orders", "Orders")
        .accelerator("CmdOrCtrl+2")
        .build(app)?;
    let customers = MenuItemBuilder::with_id("customers", "Customers")
        .accelerator("CmdOrCtrl+3")
        .build(app)?;
    let reload = MenuItemBuilder::with_id("reload", "Reload")
        .accelerator("CmdOrCtrl+R")
        .build(app)?;
    let dev_tools = MenuItemBuilder::with_id("dev_tools", "Toggle Developer Tools")
        .accelerator("F12")
        .build(app)?;

    let view_menu = SubmenuBuilder::new(app, "View")
        .item(&dashboard)
        .item(&orders)
        .item(&customers)
        .separator()
        .item(&reload)
        .item(&dev_tools)
        .build()?;

    let backup_database = MenuItemBuilder::with_id("backup_database", "Backup Database")
        .build(app)?;
    let settings = MenuItemBuilder::with_id("settings", "Settings")
        .accelerator("CmdOrCtrl+,")
        .build(app)?;

    let tools_menu = SubmenuBuilder::new(app, "Tools")
        .item(&backup_database)
        .item(&settings)
        .build()?;

    let about = MenuItemBuilder::with_id("about", "About Monic Laundry POS")
        .build(app)?;
    let help_menu = SubmenuBuilder::new(app, "Help")
        .item(&about)
        .build()?;

    MenuBuilder::new(app)
        .item(&file_menu)
        .item(&view_menu)
        .item(&tools_menu)
        .item(&help_menu)
        .build()
}
