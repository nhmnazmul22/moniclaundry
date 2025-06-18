-- Create inventory_categories table
CREATE TABLE IF NOT EXISTS inventory_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table (updated with proper structure)
DROP TABLE IF EXISTS inventory;
CREATE TABLE inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    max_stock INTEGER NOT NULL DEFAULT 100,
    unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
    cost_per_unit DECIMAL(15,2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    supplier VARCHAR(255),
    last_restock TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO inventory_categories (name, description) VALUES
('Deterjen', 'Produk deterjen untuk pencucian'),
('Pelembut', 'Pelembut kain dan fabric softener'),
('Pemutih', 'Produk pemutih pakaian'),
('Kemasan', 'Plastik, kantong, dan kemasan lainnya'),
('Aksesoris', 'Hanger, klip, dan aksesoris laundry')
ON CONFLICT (name) DO NOTHING;

-- Insert sample inventory data
INSERT INTO inventory (name, category_id, current_stock, min_stock, max_stock, unit, cost_per_unit, selling_price, supplier, expiry_date)
SELECT 
    'Deterjen Rinso 1kg',
    (SELECT id FROM inventory_categories WHERE name = 'Deterjen'),
    50, 10, 100, 'pcs', 15000, 18000, 'PT Unilever', '2025-01-15'
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE name = 'Deterjen Rinso 1kg');

INSERT INTO inventory (name, category_id, current_stock, min_stock, max_stock, unit, cost_per_unit, selling_price, supplier, expiry_date)
SELECT 
    'Softener Molto 800ml',
    (SELECT id FROM inventory_categories WHERE name = 'Pelembut'),
    8, 5, 50, 'pcs', 12000, 15000, 'PT Unilever', '2025-06-10'
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE name = 'Softener Molto 800ml');

INSERT INTO inventory (name, category_id, current_stock, min_stock, max_stock, unit, cost_per_unit, selling_price, supplier, expiry_date)
SELECT 
    'Pemutih Bayclean 1L',
    (SELECT id FROM inventory_categories WHERE name = 'Pemutih'),
    25, 5, 40, 'pcs', 8000, 10000, 'PT Kao', '2024-12-31'
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE name = 'Pemutih Bayclean 1L');

INSERT INTO inventory (name, category_id, current_stock, min_stock, max_stock, unit, cost_per_unit, selling_price, supplier)
SELECT 
    'Plastik Laundry Besar',
    (SELECT id FROM inventory_categories WHERE name = 'Kemasan'),
    200, 50, 500, 'pcs', 500, 1000, 'Toko Plastik Jaya', NULL
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE name = 'Plastik Laundry Besar');

INSERT INTO inventory (name, category_id, current_stock, min_stock, max_stock, unit, cost_per_unit, selling_price, supplier)
SELECT 
    'Hanger Plastik',
    (SELECT id FROM inventory_categories WHERE name = 'Aksesoris'),
    3, 20, 200, 'pcs', 2000, 3000, 'Toko Hanger', NULL
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE name = 'Hanger Plastik');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_category_id ON inventory(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_current_stock ON inventory(current_stock);
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);
