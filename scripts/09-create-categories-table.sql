-- Create categories table for inventory management
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES 
    ('Deterjen', 'Produk pembersih pakaian'),
    ('Pelembut', 'Pelembut kain dan pakaian'),
    ('Pemutih', 'Produk pemutih pakaian'),
    ('Kemasan', 'Plastik dan kemasan laundry'),
    ('Aksesoris', 'Hanger dan aksesoris laundry'),
    ('Lainnya', 'Kategori lainnya')
ON CONFLICT (name) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth requirements)
CREATE POLICY IF NOT EXISTS "Allow all operations on categories" ON categories
    FOR ALL USING (true);
