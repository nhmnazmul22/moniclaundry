-- Buat tabel staff terpisah tanpa foreign key constraint
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'kurir')),
    password_hash TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create policy for staff table
CREATE POLICY "Enable all operations for authenticated users" ON public.staff
    FOR ALL USING (true);

-- Insert some sample data
INSERT INTO public.staff (full_name, email, phone, role, is_active) VALUES
('Admin Monic Laundry', 'admin@moniclaundry.com', '085870037178', 'admin', true),
('Owner Monic Laundry', 'owner@moniclaundry.com', '085262249512', 'owner', true)
ON CONFLICT (email) DO NOTHING;
