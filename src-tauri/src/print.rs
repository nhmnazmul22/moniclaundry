use crate::commands::{ReceiptData, ReceiptItem};
use chrono::{DateTime, Utc};
use printpdf::*;
use std::fs::File;
use std::io::BufWriter;

pub async fn print_receipt_pdf(receipt_data: ReceiptData) -> Result<bool, String> {
    let pdf_path = create_receipt_pdf(receipt_data).await?;
    
    // Open the PDF with the default system application
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", &pdf_path])
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
    let (doc, page1, layer1) = PdfDocument::new("Receipt", Mm(80.0), Mm(200.0), "Layer 1");
    let current_layer = doc.get_page(page1).get_layer(layer1);
    
    // Add fonts (you might need to include font files in your bundle)
    let font = doc.add_builtin_font(BuiltinFont::Helvetica).unwrap();
    let font_bold = doc.add_builtin_font(BuiltinFont::HelveticaBold).unwrap();
    
    let mut y_position = Mm(180.0);
    
    // Header
    current_layer.use_text("MONIC LAUNDRY", 14.0, Mm(10.0), y_position, &font_bold);
    y_position -= Mm(6.0);
    current_layer.use_text("Jl. Laundry No. 123", 10.0, Mm(10.0), y_position, &font);
    y_position -= Mm(4.0);
    current_layer.use_text("Telp: 021-12345678", 10.0, Mm(10.0), y_position, &font);
    y_position -= Mm(8.0);
    
    // Separator line
    let line = Line {
        points: vec![(Point::new(Mm(5.0), y_position), false), (Point::new(Mm(75.0), y_position), false)],
        is_closed: false,
        has_fill: false,
        has_stroke: true,
        is_clipping_path: false,
    };
    current_layer.add_shape(line);
    y_position -= Mm(6.0);
    
    // Order details
    current_layer.use_text(&format!("No. Order: {}", receipt_data.order_number), 10.0, Mm(5.0), y_position, &font);
    y_position -= Mm(4.0);
    current_layer.use_text(&format!("Tanggal: {}", receipt_data.date), 10.0, Mm(5.0), y_position, &font);
    y_position -= Mm(4.0);
    current_layer.use_text(&format!("Customer: {}", receipt_data.customer_name), 10.0, Mm(5.0), y_position, &font);
    y_position -= Mm(6.0);
    
    // Another separator
    let line2 = Line {
        points: vec![(Point::new(Mm(5.0), y_position), false), (Point::new(Mm(75.0), y_position), false)],
        is_closed: false,
        has_fill: false,
        has_stroke: true,
        is_clipping_path: false,
    };
    current_layer.add_shape(line2);
    y_position -= Mm(6.0);
    
    // Items
    for item in &receipt_data.items {
        current_layer.use_text(&item.service, 10.0, Mm(5.0), y_position, &font);
        y_position -= Mm(4.0);
        let item_detail = format!("{}kg x {} = Rp {}", 
            item.weight, 
            format_currency(item.price), 
            format_currency(item.subtotal)
        );
        current_layer.use_text(&item_detail, 9.0, Mm(5.0), y_position, &font);
        y_position -= Mm(6.0);
    }
    
    // Final separator
    let line3 = Line {
        points: vec![(Point::new(Mm(5.0), y_position), false), (Point::new(Mm(75.0), y_position), false)],
        is_closed: false,
        has_fill: false,
        has_stroke: true,
        is_clipping_path: false,
    };
    current_layer.add_shape(line3);
    y_position -= Mm(6.0);
    
    // Total
    current_layer.use_text(&format!("TOTAL: Rp {}", format_currency(receipt_data.total)), 12.0, Mm(5.0), y_position, &font_bold);
    y_position -= Mm(8.0);
    
    // Footer
    current_layer.use_text("Terima kasih atas kepercayaan Anda!", 9.0, Mm(5.0), y_position, &font);
    y_position -= Mm(4.0);
    current_layer.use_text(&format!("Barang siap: {}", receipt_data.estimated_completion), 9.0, Mm(5.0), y_position, &font);
    
    // Save PDF
    let temp_dir = std::env::temp_dir();
    let pdf_path = temp_dir.join(format!("receipt_{}.pdf", receipt_data.order_number));
    let file = File::create(&pdf_path).map_err(|e| format!("Failed to create PDF file: {}", e))?;
    let mut writer = BufWriter::new(file);
    doc.save(&mut writer).map_err(|e| format!("Failed to save PDF: {}", e))?;
    
    Ok(pdf_path.to_string_lossy().to_string())
}

fn format_currency(amount: f64) -> String {
    format!("{:,.0}", amount).replace(',', ".")
}
