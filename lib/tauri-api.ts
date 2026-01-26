import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Window } from "@tauri-apps/api/window";
import { message, open, save } from "@tauri-apps/plugin-dialog";

const appWindow = new Window("my-label");

export interface ReceiptData {
  orderNumber: string;
  date: string;
  customerName: string;
  items: ReceiptItem[];
  total: number;
  estimatedCompletion: string;
}

export interface ReceiptItem {
  service: string;
  weight: number;
  price: number;
  subtotal: number;
}

export interface DialogOptions {
  title?: string;
  message: string;
  dialogType?: string;
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: FileFilter[];
}

export interface FileFilter {
  name: string;
  extensions: string[];
}

class TauriAPI {
  // App info
  async getVersion(): Promise<string> {
    return await invoke("get_app_version");
  }

  // Dialog methods
  async showMessageBox(options: DialogOptions): Promise<void> {
    await message(options.message, { title: options.title || "Message" });
  }

  async showSaveDialog(options: SaveDialogOptions): Promise<string | null> {
    return await save({
      title: options.title,
      defaultPath: options.defaultPath,
      filters: options.filters,
    });
  }

  async showOpenDialog(options: SaveDialogOptions): Promise<string[] | null> {
    return (await open({
      title: options.title,
      filters: options.filters,
      multiple: true,
    })) as string[] | null;
  }

  // Print methods
  async printReceipt(receiptData: ReceiptData): Promise<boolean> {
    return await invoke("print_receipt", { receiptData });
  }

  async createReceiptPdf(receiptData: ReceiptData): Promise<string> {
    return await invoke("create_receipt_pdf", { receiptData });
  }

  // System methods
  async getSystemInfo(): Promise<Record<string, string>> {
    return await invoke("get_system_info");
  }

  async backupDatabase(filePath: string): Promise<boolean> {
    return await invoke("backup_database", { filePath });
  }

  async restoreDatabase(filePath: string): Promise<boolean> {
    return await invoke("restore_database", { filePath });
  }

  // Navigation
  async navigateTo(path: string): Promise<void> {
    return await invoke("navigate_to", { path });
  }

  // Event listeners
  onMenuNewOrder(callback: () => void) {
    return listen("menu-new-order", callback);
  }

  onMenuPrintReceipt(callback: () => void) {
    return listen("menu-print-receipt", callback);
  }

  onMenuNavigate(callback: (event: { payload: string }) => void) {
    return listen("menu-navigate", callback);
  }

  onMenuBackupDatabase(callback: () => void) {
    return listen("menu-backup-database", callback);
  }

  // Window controls
  async minimizeWindow() {
    return await appWindow.minimize();
  }

  async maximizeWindow() {
    return await appWindow.maximize();
  }

  async closeWindow() {
    return await appWindow.close();
  }
}

export const tauriAPI = new TauriAPI();

// For compatibility with existing Electron code
export const electronAPI = tauriAPI;
