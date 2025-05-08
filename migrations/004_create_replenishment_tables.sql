-- Create replenishment_order table
CREATE TABLE IF NOT EXISTS replenishment_order (
    replenishment_id SERIAL PRIMARY KEY,
    location_id INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status order_status DEFAULT 'pending',
    FOREIGN KEY (location_id) REFERENCES org_locations(location_id) ON DELETE CASCADE
);

-- Create replenishment_levels table
CREATE TABLE IF NOT EXISTS replenishment_levels (
    level_id SERIAL PRIMARY KEY,
    location_id INT NOT NULL,
    product_id INT NOT NULL,
    target_level INT NOT NULL,
    current_level INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES org_locations(location_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE(location_id, product_id)
);

-- Create replenishment_details table
CREATE TABLE IF NOT EXISTS replenishment_details (
    detail_id SERIAL PRIMARY KEY,
    replenishment_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (replenishment_id) REFERENCES replenishment_order(replenishment_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Create stock_out_history table
CREATE TABLE IF NOT EXISTS stock_out_history (
    history_id SERIAL PRIMARY KEY,
    location_id INT NOT NULL,
    product_id INT NOT NULL,
    stock_out_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES org_locations(location_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Create stock_out_counter table
CREATE TABLE IF NOT EXISTS stock_out_counter (
    counter_id SERIAL PRIMARY KEY,
    location_id INT NOT NULL,
    product_id INT NOT NULL,
    consecutive_weeks INT DEFAULT 1,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES org_locations(location_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    UNIQUE(location_id, product_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_replenishment_location ON replenishment_order(location_id);
CREATE INDEX IF NOT EXISTS idx_replenishment_status ON replenishment_order(status);
CREATE INDEX IF NOT EXISTS idx_stock_out_history_location ON stock_out_history(location_id);
CREATE INDEX IF NOT EXISTS idx_stock_out_history_product ON stock_out_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_out_history_date ON stock_out_history(stock_out_date);
