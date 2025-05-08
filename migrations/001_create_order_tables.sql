-- Create ENUM types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('pending', 'processing', 'delivered', 'cancelled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_status') THEN
        CREATE TYPE delivery_status AS ENUM ('scheduled', 'in_transit', 'delivered', 'failed');
    END IF;
END$$;

-- Create order_item table
CREATE TABLE IF NOT EXISTS order_item (
    order_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scheduled_delivery_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'pending',
    location_id INT,
    order_type VARCHAR(20) NOT NULL, -- 'customer' or 'organization'
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (location_id) REFERENCES org_locations(location_id)
);

-- Create order_details table
CREATE TABLE IF NOT EXISTS order_details (
    detail_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES order_item(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Create payment table
CREATE TABLE IF NOT EXISTS payment (
    payment_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(255),
    FOREIGN KEY (order_id) REFERENCES order_item(order_id) ON DELETE CASCADE
);

-- Create delivery_order table
CREATE TABLE IF NOT EXISTS delivery_order (
    delivery_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    driver_name VARCHAR(255),
    vehicle_id VARCHAR(50),
    departure_time TIMESTAMP WITH TIME ZONE,
    delivery_status delivery_status DEFAULT 'scheduled',
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES order_item(order_id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_order_user ON order_item(user_id);
CREATE INDEX IF NOT EXISTS idx_order_status ON order_item(status);
CREATE INDEX IF NOT EXISTS idx_order_date ON order_item(order_date);
CREATE INDEX IF NOT EXISTS idx_order_location ON order_item(location_id);
CREATE INDEX IF NOT EXISTS idx_order_details_order ON order_details(order_id);
CREATE INDEX IF NOT EXISTS idx_order_details_product ON order_details(product_id);
CREATE INDEX IF NOT EXISTS idx_payment_order ON payment(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(status);
CREATE INDEX IF NOT EXISTS idx_delivery_order ON delivery_order(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status ON delivery_order(delivery_status);