-- =====================================================
-- İşletme Satış ve Sipariş Yönetim Sistemi
-- PostgreSQL Veritabanı Şeması
-- =====================================================

-- Enum Types
CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF');
CREATE TYPE payment_type AS ENUM ('CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'OTHER');
CREATE TYPE order_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- =====================================================
-- KULLANICI TABLOSU (Users)
-- =====================================================
CREATE TABLE users (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- bcrypt hash
    name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'STAFF' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for email lookup during login
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- MÜŞTERİ TABLOSU (Customers)
-- =====================================================
CREATE TABLE customers (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_by_id VARCHAR(25) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for search and filtering
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_created_by ON customers(created_by_id);

-- =====================================================
-- ÜRÜN TABLOSU (Products)
-- =====================================================
CREATE TABLE products (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(50) UNIQUE,
    description TEXT,
    category VARCHAR(100),
    purchase_price DECIMAL(10, 2) NOT NULL,  -- Alış fiyatı
    sell_price DECIMAL(10, 2) NOT NULL,      -- Varsayılan satış fiyatı
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for search and filtering
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);

-- =====================================================
-- SİPARİŞ TABLOSU (Orders)
-- =====================================================
CREATE TABLE orders (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_number VARCHAR(20) UNIQUE NOT NULL,  -- SIP-2024-0001 formatı
    customer_id VARCHAR(25) NOT NULL REFERENCES customers(id),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_type payment_type DEFAULT 'CASH' NOT NULL,
    status order_status DEFAULT 'COMPLETED' NOT NULL,
    notes TEXT,
    created_by_id VARCHAR(25) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for filtering and reporting
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);

-- =====================================================
-- SİPARİŞ SATIRI TABLOSU (Order Items)
-- =====================================================
CREATE TABLE order_items (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id VARCHAR(25) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(25) NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,       -- Siparişteki satış fiyatı
    purchase_price DECIMAL(10, 2) NOT NULL,   -- O andaki alış fiyatı (kar hesabı için)
    subtotal DECIMAL(10, 2) NOT NULL          -- quantity * unit_price
);

-- Indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- =====================================================
-- İŞLETME BİLGİLERİ TABLOSU (Business Info)
-- =====================================================
CREATE TABLE business_info (
    id VARCHAR(25) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(200) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    tax_number VARCHAR(20),  -- Vergi numarası
    logo VARCHAR(500)        -- Logo URL
);

-- =====================================================
-- SİPARİŞ NUMARASI OLUŞTURMA FONKSİYONU
-- =====================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_number INTEGER;
BEGIN
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_number FROM 10 FOR 4) AS INTEGER)
    ), 0) + 1
    INTO next_number
    FROM orders
    WHERE order_number LIKE 'SIP-' || current_year || '-%';
    
    RETURN 'SIP-' || current_year || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UPDATED_AT OTOMATİK GÜNCELLEME TRİGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ÖRNEK VERİLER (Seed Data)
-- =====================================================

-- Admin kullanıcısı (şifre: admin123 - bcrypt hash)
INSERT INTO users (id, email, password, name, role) VALUES
('admin-001', 'admin@isletme.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiLXCJPpODmu', 'Yönetici', 'ADMIN');

-- İşletme bilgileri
INSERT INTO business_info (id, name, address, phone, email, tax_number) VALUES
('business-001', 'Örnek Ticaret', 'Örnek Mah. No:1, Kadıköy/İstanbul', '0212 123 4567', 'info@ornekticaret.com', '1234567890');

-- Örnek müşteriler
INSERT INTO customers (id, name, phone, email, address, notes, created_by_id) VALUES
('cust-001', 'Ahmet Yılmaz', '0532 123 4567', 'ahmet@email.com', 'Kadıköy, İstanbul', 'VIP müşteri', 'admin-001'),
('cust-002', 'Fatma Kaya', '0544 987 6543', 'fatma@email.com', 'Çankaya, Ankara', NULL, 'admin-001'),
('cust-003', 'Mehmet Demir', '0555 456 7890', 'mehmet@email.com', 'Konak, İzmir', 'Toptan alıcı', 'admin-001');

-- Örnek ürünler
INSERT INTO products (id, name, sku, description, category, purchase_price, sell_price, stock_quantity) VALUES
('prod-001', 'Laptop HP ProBook', 'LP-001', '15.6 inç, i5, 8GB RAM', 'Elektronik', 15000.00, 18500.00, 5),
('prod-002', 'Kablosuz Mouse', 'MS-002', 'Ergonomik tasarım', 'Aksesuar', 150.00, 250.00, 42),
('prod-003', 'Mekanik Klavye', 'KB-003', 'RGB aydınlatma', 'Aksesuar', 300.00, 450.00, 18),
('prod-004', 'USB-C Hub', 'HB-004', '7-in-1 hub', 'Aksesuar', 200.00, 350.00, 25),
('prod-005', 'Monitor 24"', 'MN-005', 'Full HD IPS panel', 'Elektronik', 2500.00, 3200.00, 8);

-- Örnek siparişler
INSERT INTO orders (id, order_number, customer_id, order_date, total_amount, payment_type, status, created_by_id) VALUES
('order-001', 'SIP-2024-0001', 'cust-001', '2024-11-25 14:35:00', 19000.00, 'CREDIT_CARD', 'COMPLETED', 'admin-001'),
('order-002', 'SIP-2024-0002', 'cust-002', '2024-11-26 11:20:00', 3900.00, 'CASH', 'COMPLETED', 'admin-001'),
('order-003', 'SIP-2024-0003', 'cust-003', '2024-11-27 09:15:00', 700.00, 'BANK_TRANSFER', 'COMPLETED', 'admin-001');

-- Örnek sipariş satırları
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, purchase_price, subtotal) VALUES
-- Sipariş 1: Ahmet Yılmaz
('item-001', 'order-001', 'prod-001', 1, 18500.00, 15000.00, 18500.00),
('item-002', 'order-001', 'prod-002', 2, 250.00, 150.00, 500.00),
-- Sipariş 2: Fatma Kaya
('item-003', 'order-002', 'prod-005', 1, 3200.00, 2500.00, 3200.00),
('item-004', 'order-002', 'prod-004', 2, 350.00, 200.00, 700.00),
-- Sipariş 3: Mehmet Demir (toptan indirimli fiyat)
('item-005', 'order-003', 'prod-002', 4, 175.00, 150.00, 700.00);  -- İndirimli fiyat!

-- =====================================================
-- FAYDALI VIEW'LAR
-- =====================================================

-- Müşteri özet bilgileri (toplam sipariş, harcama)
CREATE VIEW customer_summary AS
SELECT 
    c.id,
    c.name,
    c.phone,
    c.email,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    MAX(o.order_date) as last_order_date
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id AND o.status = 'COMPLETED'
WHERE c.is_active = true
GROUP BY c.id, c.name, c.phone, c.email;

-- Ürün satış özeti
CREATE VIEW product_sales_summary AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.category,
    p.purchase_price,
    p.sell_price,
    p.stock_quantity,
    COALESCE(SUM(oi.quantity), 0) as total_sold,
    COALESCE(SUM(oi.subtotal), 0) as total_revenue,
    COALESCE(SUM((oi.unit_price - oi.purchase_price) * oi.quantity), 0) as total_profit
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status = 'COMPLETED'
WHERE p.is_active = true
GROUP BY p.id, p.name, p.sku, p.category, p.purchase_price, p.sell_price, p.stock_quantity;

-- Günlük satış özeti
CREATE VIEW daily_sales_summary AS
SELECT 
    DATE(order_date) as sale_date,
    COUNT(*) as order_count,
    SUM(total_amount) as total_sales,
    SUM(
        (SELECT SUM((oi.unit_price - oi.purchase_price) * oi.quantity) 
         FROM order_items oi WHERE oi.order_id = o.id)
    ) as total_profit
FROM orders o
WHERE status = 'COMPLETED'
GROUP BY DATE(order_date)
ORDER BY sale_date DESC;

-- =====================================================
-- KULLANIM ÖRNEKLERİ
-- =====================================================

-- Yeni sipariş oluşturma örneği:
/*
BEGIN;

-- 1. Sipariş oluştur
INSERT INTO orders (id, order_number, customer_id, total_amount, payment_type, created_by_id)
VALUES (
    gen_random_uuid()::text,
    generate_order_number(),
    'cust-001',
    0,  -- Geçici, sonra güncellenecek
    'CREDIT_CARD',
    'admin-001'
) RETURNING id INTO @order_id;

-- 2. Sipariş satırları ekle
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, purchase_price, subtotal)
VALUES 
    (gen_random_uuid()::text, @order_id, 'prod-001', 1, 18500.00, 15000.00, 18500.00),
    (gen_random_uuid()::text, @order_id, 'prod-002', 2, 250.00, 150.00, 500.00);

-- 3. Sipariş toplamını güncelle
UPDATE orders 
SET total_amount = (SELECT SUM(subtotal) FROM order_items WHERE order_id = @order_id)
WHERE id = @order_id;

COMMIT;
*/

-- Müşteri sipariş geçmişi sorgusu:
/*
SELECT 
    o.order_number,
    o.order_date,
    o.total_amount,
    o.payment_type,
    o.status,
    json_agg(json_build_object(
        'product', p.name,
        'quantity', oi.quantity,
        'unit_price', oi.unit_price,
        'subtotal', oi.subtotal
    )) as items
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.customer_id = 'cust-001'
GROUP BY o.id, o.order_number, o.order_date, o.total_amount, o.payment_type, o.status
ORDER BY o.order_date DESC;
*/

-- Kar marjı raporu:
/*
SELECT 
    p.name,
    p.purchase_price as alis_fiyati,
    p.sell_price as satis_fiyati,
    (p.sell_price - p.purchase_price) as kar_tutari,
    ROUND(((p.sell_price - p.purchase_price) / p.purchase_price * 100), 2) as kar_yuzdesi
FROM products p
WHERE p.is_active = true
ORDER BY kar_yuzdesi DESC;
*/

