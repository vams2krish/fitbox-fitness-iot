CREATE TABLE IF NOT EXISTS fitbox_profiles (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  profile JSONB NOT NULL DEFAULT '{}', updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS fitbox_sessions (
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, exercise TEXT NOT NULL, local_day DATE NOT NULL,
  summary JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, session_id)
);
CREATE INDEX IF NOT EXISTS fitbox_sessions_day ON fitbox_sessions(user_id, local_day DESC);
CREATE TABLE IF NOT EXISTS fitbox_claims (
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  exercise TEXT NOT NULL, local_day DATE NOT NULL, xp INTEGER NOT NULL CHECK(xp=25),
  PRIMARY KEY(user_id, exercise, local_day)
);
CREATE TABLE IF NOT EXISTS fitbox_rest_days (
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE, local_day DATE NOT NULL,
  PRIMARY KEY(user_id, local_day)
);
CREATE TABLE IF NOT EXISTS fitbox_feedback (
  id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK(rating BETWEEN 1 AND 5), note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS fitbox_preferences (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  email_reports BOOLEAN NOT NULL DEFAULT false, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS fitbox_subscriptions (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  customer_id TEXT UNIQUE, subscription_id TEXT UNIQUE, tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'inactive', period_end TIMESTAMPTZ, updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS fitbox_webhook_events (
  event_id TEXT PRIMARY KEY, event_type TEXT NOT NULL, processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS fitbox_rate_limits (
  user_id TEXT NOT NULL, action TEXT NOT NULL, bucket BIGINT NOT NULL, count INTEGER NOT NULL,
  PRIMARY KEY(user_id,action,bucket)
);
ALTER TABLE fitbox_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitbox_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitbox_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitbox_rest_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitbox_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitbox_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitbox_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitbox_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitbox_rate_limits ENABLE ROW LEVEL SECURITY;
-- Only the server database role accesses these tables. No public Data API is exposed.
