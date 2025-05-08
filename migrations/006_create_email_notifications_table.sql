-- Create email_notifications table according to the provided schema
CREATE TABLE IF NOT EXISTS email_notifications (
    notification_id SERIAL PRIMARY KEY,
    org_id INT NOT NULL,
    location_id INT NOT NULL,
    product_id INT NOT NULL,
    sent_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_to VARCHAR(255) NOT NULL,
    FOREIGN KEY (org_id) REFERENCES organizations_profiles(org_id),
    FOREIGN KEY (location_id) REFERENCES org_locations(location_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_org ON email_notifications(org_id);
CREATE INDEX IF NOT EXISTS idx_notifications_location ON email_notifications(location_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_to ON email_notifications(sent_to);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_date ON email_notifications(sent_date);

-- Add trigger to update read_date when is_read is set to true
CREATE OR REPLACE FUNCTION update_notification_read_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
        NEW.read_date = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_notification_read_date
    BEFORE UPDATE ON email_notifications
    FOR EACH ROW
    EXECUTE PROCEDURE update_notification_read_date();