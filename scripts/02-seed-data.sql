-- Insert default services
INSERT INTO services (name, description, price_per_kg, min_weight, estimated_hours, category) VALUES
('Cuci Kering Reguler', 'Cuci dan kering standar', 5000, 1.0, 24, 'regular'),
('Cuci Kering Express', 'Cuci dan kering dalam 6 jam', 8000, 1.0, 6, 'express'),
('Cuci Setrika', 'Cuci, kering, dan setrika', 7000, 1.0, 48, 'premium'),
('Setrika Saja', 'Hanya setrika', 3000, 1.0, 12, 'ironing'),
('Dry Clean', 'Cuci kering khusus', 15000, 0.5, 72, 'special'),
('Cuci Sepatu', 'Cuci sepatu dan sandal', 10000, 1.0, 24, 'shoes'),
('Cuci Karpet', 'Cuci karpet dan permadani', 12000, 1.0, 48, 'carpet');

-- Insert sample customers
INSERT INTO customers (name, phone, email, address, loyalty_points) VALUES
('Budi Santoso', '081234567890', 'budi@email.com', 'Jl. Merdeka No. 123, Jakarta', 150),
('Siti Nurhaliza', '081234567891', 'siti@email.com', 'Jl. Sudirman No. 456, Jakarta', 200),
('Ahmad Rahman', '081234567892', 'ahmad@email.com', 'Jl. Thamrin No. 789, Jakarta', 75),
('Maya Sari', '081234567893', 'maya@email.com', 'Jl. Gatot Subroto No. 321, Jakarta', 300),
('Rudi Hermawan', '081234567894', 'rudi@email.com', 'Jl. Kuningan No. 654, Jakarta', 120);

-- Insert inventory items
INSERT INTO inventory (item_name, category, current_stock, min_stock, unit, cost_per_unit, selling_price, supplier) VALUES
('Deterjen Rinso 1kg', 'Deterjen', 50, 10, 'pcs', 15000, 18000, 'PT Unilever'),
('Softener Molto 800ml', 'Pelembut', 30, 5, 'pcs', 12000, 15000, 'PT Unilever'),
('Pemutih Bayclean 1L', 'Pemutih', 25, 5, 'pcs', 8000, 10000, 'PT Kao'),
('Plastik Laundry Besar', 'Kemasan', 200, 50, 'pcs', 500, 1000, 'Toko Plastik Jaya'),
('Plastik Laundry Kecil', 'Kemasan', 300, 100, 'pcs', 300, 500, 'Toko Plastik Jaya'),
('Hanger Plastik', 'Aksesoris', 100, 20, 'pcs', 2000, 3000, 'Toko Hanger'),
('Label Stiker', 'Administrasi', 500, 100, 'pcs', 100, 200, 'Percetakan Maju');

-- Insert system settings
INSERT INTO settings (key, value, description, category) VALUES
('business_name', 'Monic Laundry', 'Nama bisnis laundry', 'general'),
('business_address', 'Jl. Raya Laundry No. 123, Jakarta', 'Alamat bisnis', 'general'),
('business_phone', '021-12345678', 'Nomor telepon bisnis', 'general'),
('business_email', 'info@moniclaundry.com', 'Email bisnis', 'general'),
('tax_rate', '0.11', 'Tarif pajak (PPN 11%)', 'financial'),
('delivery_fee', '5000', 'Biaya antar default', 'delivery'),
('min_order_free_delivery', '50000', 'Minimum order untuk gratis antar', 'delivery'),
('loyalty_point_rate', '0.01', 'Rate poin loyalty (1% dari total)', 'loyalty'),
('operating_hours_start', '07:00', 'Jam buka operasional', 'operational'),
('operating_hours_end', '21:00', 'Jam tutup operasional', 'operational'),
('whatsapp_number', '6281234567890', 'Nomor WhatsApp untuk notifikasi', 'notification'),
('receipt_footer', 'Terima kasih telah menggunakan jasa Monic Laundry!', 'Footer nota', 'receipt');
