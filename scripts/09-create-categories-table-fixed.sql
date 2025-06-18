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

-- Enable RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations on categories" ON categories;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on categories" 
ON categories 
FOR ALL 
TO authenticated, anon 
USING (true) 
WITH CHECK (true);
