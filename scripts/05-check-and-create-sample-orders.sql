-- Check existing orders
SELECT id, order_number, order_status, customer_id, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- Check existing customers
SELECT id, name, phone, address 
FROM customers 
LIMIT 5;

-- If no orders exist, create some sample orders
INSERT INTO orders (
  order_number, 
  customer_id, 
  order_status, 
  total_amount, 
  payment_status,
  notes,
  created_at
) 
SELECT 
  'ORD-' || LPAD((ROW_NUMBER() OVER())::text, 4, '0'),
  c.id,
  'delivered',
  50000 + (RANDOM() * 100000)::int,
  'paid',
  'Sample order for delivery testing',
  NOW() - (RANDOM() * INTERVAL '7 days')
FROM customers c
LIMIT 5
ON CONFLICT DO NOTHING;

-- Create some ready orders too
INSERT INTO orders (
  order_number, 
  customer_id, 
  order_status, 
  total_amount, 
  payment_status,
  notes,
  created_at
) 
SELECT 
  'ORD-' || LPAD((5 + ROW_NUMBER() OVER())::text, 4, '0'),
  c.id,
  'ready',
  30000 + (RANDOM() * 80000)::int,
  'paid',
  'Ready for pickup/delivery',
  NOW() - (RANDOM() * INTERVAL '3 days')
FROM customers c
LIMIT 3
ON CONFLICT DO NOTHING;

-- Check the results
SELECT 
  o.id,
  o.order_number,
  o.order_status,
  c.name as customer_name,
  c.address as customer_address,
  o.total_amount,
  o.created_at
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.order_status IN ('delivered', 'ready')
ORDER BY o.created_at DESC;
