use crate::commands::ReceiptData;

pub async fn print_receipt_pdf(receipt_data: ReceiptData) -> Result<bool, String> {
    let pdf_path = create_receipt_pdf(receipt_data).await?;
    
    // Open the PDF with the default system application
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", "", &pdf_path])
            .spawn()
            .map_err(|e| format!("Failed to open PDF: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&pdf_path)
            .spawn()
            .map_err(|e| format!("Failed to open PDF: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&pdf_path)
            .spawn()
            .map_err(|e| format!("Failed to open PDF: {}", e))?;
    }
    
    Ok(true)
}

pub async fn create_receipt_pdf(receipt_data: ReceiptData) -> Result<String, String> {
    // Create a simple text-based receipt instead of using complex PDF operations
    let receipt_content = format_receipt_text(&receipt_data);
    
    // For now, let's create a simple text file instead of PDF
    // This is a fallback until we can properly configure printpdf
    let temp_dir = std::env::temp_dir();
    let receipt_path = temp_dir.join(format!("receipt_{}.txt", receipt_data.order_number));
    
    std::fs::write(&receipt_path, receipt_content)
        .map_err(|e| format!("Failed to create receipt file: {}", e))?;
    
    Ok(receipt_path.to_string_lossy().to_string())
}

fn format_receipt_text(receipt_data: &ReceiptData) -> String {
    let mut content = String::new();
    
    // Header
    content.push_str("========================================\n");
    content.push_str("              MONIC LAUNDRY             \n");
    content.push_str("           Jl. Laundry No. 123          \n");
    content.push_str("           Telp: 021-12345678           \n");
    content.push_str("========================================\n\n");
    
    // Order details
    content.push_str(&format!("No. Order    : {}\n", receipt_data.order_number));
    content.push_str(&format!("Tanggal      : {}\n", receipt_data.date));
    content.push_str(&format!("Customer     : {}\n", receipt_data.customer_name));
    content.push_str("----------------------------------------\n");
    
    // Items
    for item in &receipt_data.items {
        content.push_str(&format!("{}\n", item.service));
        content.push_str(&format!("{}kg x {} = Rp {}\n\n", 
            item.weight, 
            format_currency(item.price), 
            format_currency(item.subtotal)
        ));
    }
    
    content.push_str("========================================\n");
    content.push_str(&format!("TOTAL: Rp {}\n", format_currency(receipt_data.total)));
    content.push_str("========================================\n\n");
    
    // Footer
    content.push_str("Terima kasih atas kepercayaan Anda!\n");
    content.push_str(&format!("Barang siap: {}\n", receipt_data.estimated_completion));
    
    content
}

fn format_currency(amount: f64) -> String {
    format!("{:.0}", amount).replace(',', ".")
}
