-- Create deliveries table if not exists
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    kurir_id UUID, -- Reference to staff table
    delivery_type VARCHAR(20) CHECK (delivery_type IN ('pickup', 'delivery')) DEFAULT 'delivery',
    scheduled_time TIMESTAMP WITH TIME ZONE,
    actual_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'cancelled')) DEFAULT 'scheduled',
    customer_address TEXT,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create some sample delivery data
INSERT INTO deliveries (order_id, kurir_id, delivery_type, scheduled_time, status, customer_address, delivery_fee, notes) 
SELECT 
    o.id as order_id,
    s.id as kurir_id,
    'delivery' as delivery_type,
    NOW() + INTERVAL '1 day' as scheduled_time,
    'scheduled' as status,
    c.address as customer_address,
    5000 as delivery_fee,
    'Sample delivery for testing' as notes
FROM orders o
CROSS JOIN (SELECT id FROM staff WHERE role = 'kurir' LIMIT 1) s
JOIN customers c ON o.customer_id = c.id
WHERE o.order_status = 'selesai'
LIMIT 3;

-- Add some more sample deliveries with different statuses
INSERT INTO deliveries (order_id, kurir_id, delivery_type, scheduled_time, actual_time, status, customer_address, delivery_fee, notes) 
SELECT 
    o.id as order_id,
    s.id as kurir_id,
    'pickup' as delivery_type,
    NOW() - INTERVAL '2 hours' as scheduled_time,
    NOW() - INTERVAL '1 hour' as actual_time,
    'completed' as status,
    c.address as customer_address,
    0 as delivery_fee,
    'Pickup completed successfully' as notes
FROM orders o
CROSS JOIN (SELECT id FROM staff WHERE role = 'kurir' LIMIT 1) s
JOIN customers c ON o.customer_id = c.id
WHERE o.order_status = 'selesai'
LIMIT 1;
