-- Create branches table if not exists
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('main', 'branch')),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.branches;
CREATE POLICY "Enable read access for all users" ON public.branches
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.branches
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.branches
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert sample branches if table is empty
INSERT INTO public.branches (name, type, address, phone, email, is_active)
SELECT * FROM (
    VALUES 
    ('Monic Laundry Pusat', 'main', 'Jl. Raya Utama No. 123, Jakarta', '021-12345678', 'pusat@moniclaundry.com', true),
    ('Monic Laundry Cabang Selatan', 'branch', 'Jl. Selatan No. 456, Jakarta Selatan', '021-87654321', 'selatan@moniclaundry.com', true),
    ('Monic Laundry Cabang Utara', 'branch', 'Jl. Utara No. 789, Jakarta Utara', '021-11223344', 'utara@moniclaundry.com', true)
) AS new_branches(name, type, address, phone, email, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.branches LIMIT 1);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_branches_updated_at ON public.branches;
CREATE TRIGGER update_branches_updated_at
    BEFORE UPDATE ON public.branches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.branches TO authenticated;
GRANT ALL ON public.branches TO anon;
