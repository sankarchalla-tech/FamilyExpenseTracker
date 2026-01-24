-- Migration script to add new tables and update categories

-- Drop old categories and reinsert with new ones
DELETE FROM categories WHERE is_default = true;

-- Insert new default categories
INSERT INTO categories (name, color, is_default) VALUES
    ('Housing', '#3B82F6', true),
    ('Bills', '#F59E0B', true),
    ('Shopping', '#8B5CF6', true),
    ('Transport', '#10B981', true),
    ('Ration', '#EF4444', true),
    ('Credit Card', '#EC4899', true),
    ('Medical', '#6366F1', true),
    ('Dining', '#14B8A6', true),
    ('Travel', '#F97316', true),
    ('Other', '#6B7280', true)
ON CONFLICT DO NOTHING;

-- Create income table if not exists
CREATE TABLE IF NOT EXISTS income (
    id SERIAL PRIMARY KEY,
    family_id INTEGER REFERENCES families(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    month VARCHAR(7) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for income table
CREATE INDEX IF NOT EXISTS idx_income_family_id ON income(family_id);
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_income_month ON income(month);

-- Create future_expenses table if not exists
CREATE TABLE IF NOT EXISTS future_expenses (
    id SERIAL PRIMARY KEY,
    family_id INTEGER REFERENCES families(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    monthly_amount DECIMAL(10, 2) NOT NULL,
    start_month VARCHAR(7) NOT NULL,
    end_month VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for future_expenses table
CREATE INDEX IF NOT EXISTS idx_future_expenses_family_id ON future_expenses(family_id);
CREATE INDEX IF NOT EXISTS idx_future_expenses_user_id ON future_expenses(user_id);