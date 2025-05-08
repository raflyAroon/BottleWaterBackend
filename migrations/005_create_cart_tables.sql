-- Create cart table according to the provided schema
CREATE TABLE IF NOT EXISTS cart (
    cart_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart(product_id);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update timestamp on cart
CREATE TRIGGER update_cart_timestamp
    BEFORE UPDATE ON cart
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
