-- Test connection and create branches table
DO $$
BEGIN
    RAISE NOTICE 'Testing database connection...';
    
    -- Check if branches table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'branches') THEN
        RAISE NOTICE 'Creating branches table...';
        
        -- Create branches table
        CREATE TABLE public.branches (
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
        
        RAISE NOTICE 'Branches table created successfully';
    ELSE
        RAISE NOTICE 'Branches table already exists';
    END IF;
    
    -- Enable RLS
    ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.branches;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.branches;
    DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.branches;
    DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.branches;
    
    -- Create simple RLS policies
    CREATE POLICY "Allow all operations for authenticated users" ON public.branches
        FOR ALL USING (auth.role() = 'authenticated');
        
    CREATE POLICY "Allow read for anonymous users" ON public.branches
        FOR SELECT USING (true);
    
    RAISE NOTICE 'RLS policies created successfully';
    
    -- Check if branches table is empty
    IF NOT EXISTS (SELECT 1 FROM public.branches LIMIT 1) THEN
        RAISE NOTICE 'Inserting sample branches...';
        
        -- Insert sample branches
        INSERT INTO public.branches (name, type, address, phone, email, is_active) VALUES
        ('Monic Laundry Pusat', 'main', 'Jl. Raya Utama No. 123, Jakarta', '021-12345678', 'pusat@moniclaundry.com', true),
        ('Monic Laundry Cabang Selatan', 'branch', 'Jl. Selatan No. 456, Jakarta Selatan', '021-87654321', 'selatan@moniclaundry.com', true),
        ('Monic Laundry Cabang Utara', 'branch', 'Jl. Utara No. 789, Jakarta Utara', '021-11223344', 'utara@moniclaundry.com', true),
        ('Monic Laundry Cabang Barat', 'branch', 'Jl. Barat No. 101, Jakarta Barat', '021-55667788', 'barat@moniclaundry.com', true),
        ('Monic Laundry Cabang Timur', 'branch', 'Jl. Timur No. 202, Jakarta Timur', '021-99887766', 'timur@moniclaundry.com', true);
        
        RAISE NOTICE 'Sample branches inserted successfully';
    ELSE
        RAISE NOTICE 'Branches table already contains data';
    END IF;
    
    -- Create updated_at trigger
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $trigger$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $trigger$ language 'plpgsql';
    
    DROP TRIGGER IF EXISTS update_branches_updated_at ON public.branches;
    CREATE TRIGGER update_branches_updated_at
        BEFORE UPDATE ON public.branches
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    
    -- Grant permissions
    GRANT ALL ON public.branches TO authenticated;
    GRANT SELECT ON public.branches TO anon;
    
    RAISE NOTICE 'Database setup completed successfully!';
    
    -- Show final count
    DECLARE
        branch_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO branch_count FROM public.branches;
        RAISE NOTICE 'Total branches in database: %', branch_count;
    END;
END $$;

-- Test query
SELECT 
    id,
    name,
    type,
    address,
    phone,
    email,
    is_active,
    created_at
FROM public.branches 
ORDER BY name;
