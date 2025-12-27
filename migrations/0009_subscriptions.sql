-- ============================================
-- PASSIONBOTS LMS - SUBSCRIPTION SYSTEM
-- Tables for Razorpay payments and subscriptions
-- ============================================

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id TEXT UNIQUE NOT NULL,
    plan_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    original_price INTEGER NOT NULL,
    duration TEXT NOT NULL,
    features TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert 3 Plans
INSERT OR IGNORE INTO subscription_plans (plan_id, plan_name, price, original_price, duration, features) VALUES
('basic', 'Basic Plan', 2500, 3000, 'monthly', 'Access to K-12 Curriculum,Live Zoom Sessions (2 per week),Pre-recorded Video Lessons,Email Support,Student Dashboard,Progress Tracking,Basic Resources & Materials'),
('standard', 'Standard Plan', 4000, 5000, 'monthly', 'Everything in Basic Plan,Live Zoom Sessions (4 per week),Mentor Chat Support,Assignment Submissions,Quiz & Tests Access,Certificates on Completion,Project Templates,Priority Support'),
('premium', 'Premium Plan', 8000, 10000, 'monthly', 'Everything in Standard Plan,Unlimited Live Sessions,1-on-1 Mentor Sessions (2 per week),Custom Learning Path,IoT Kit Included (First Month),Advanced Projects Access,Job Placement Assistance,24/7 Priority Support,Community Forum Access');

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_id TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    amount INTEGER NOT NULL,
    payment_id TEXT UNIQUE NOT NULL,
    order_id TEXT NOT NULL,
    signature TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME NOT NULL,
    auto_renew INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id)
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    subscription_id INTEGER,
    razorpay_payment_id TEXT UNIQUE NOT NULL,
    razorpay_order_id TEXT NOT NULL,
    razorpay_signature TEXT NOT NULL,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

-- User Customization Table (for subscriber customizations)
CREATE TABLE IF NOT EXISTS user_customizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    theme_color TEXT DEFAULT '#FFD700',
    dashboard_layout TEXT DEFAULT 'default',
    notification_preferences TEXT,
    custom_settings TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id)
);

-- Subscription Resources Access Table
CREATE TABLE IF NOT EXISTS subscription_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscription_id INTEGER NOT NULL,
    resource_type TEXT NOT NULL,
    resource_name TEXT NOT NULL,
    resource_url TEXT,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(razorpay_payment_id);

-- Add subscription_plan_id column to students table if not exists
-- This links students to their current subscription
-- ALTER TABLE students ADD COLUMN subscription_plan_id TEXT DEFAULT NULL;
-- ALTER TABLE students ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
-- ALTER TABLE students ADD COLUMN subscription_end_date DATETIME DEFAULT NULL;
