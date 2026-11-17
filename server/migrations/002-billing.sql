ALTER TABLE fitbox_subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE fitbox_subscriptions ADD COLUMN IF NOT EXISTS checkout_id TEXT;
ALTER TABLE fitbox_subscriptions ADD COLUMN IF NOT EXISTS checkout_expires TIMESTAMPTZ;
ALTER TABLE fitbox_subscriptions ADD COLUMN IF NOT EXISTS checkout_plan TEXT;
