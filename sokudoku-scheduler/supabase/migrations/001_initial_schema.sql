-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Eventsテーブル（調整ボード）
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id VARCHAR(22) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  visible_from TIMESTAMPTZ NOT NULL,
  visible_to TIMESTAMPTZ NOT NULL,
  view_mode VARCHAR(20) NOT NULL CHECK (view_mode IN ('table', 'calendar')),
  edit_token VARCHAR(64) UNIQUE NOT NULL,
  cancel_before_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Slotsテーブル（提供枠）
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  provider_name VARCHAR(100) NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'booked', 'canceled')),
  cancel_token VARCHAR(64) UNIQUE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bookingsテーブル（予約）
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID UNIQUE NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  attendee_name VARCHAR(100) NOT NULL,
  attendee_contact VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'canceled')),
  cancel_token VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logsテーブル（監査ログ）
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_events_public_id ON events(public_id);
CREATE INDEX idx_events_visible_dates ON events(visible_from, visible_to);
CREATE INDEX idx_slots_event_id ON slots(event_id);
CREATE INDEX idx_slots_start_at ON slots(start_at);
CREATE INDEX idx_slots_status ON slots(status);
CREATE INDEX idx_bookings_slot_id ON bookings(slot_id);
CREATE INDEX idx_audit_logs_event_id ON audit_logs(event_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 更新時刻自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_slots_updated_at BEFORE UPDATE ON slots
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RLS (Row Level Security) ポリシー
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- すべてのテーブルに対して、認証なしでアクセス可能にする（URLを知っている人のみ）
CREATE POLICY "Public can view events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Public can create events" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update events with edit token" ON events
  FOR UPDATE USING (true);

CREATE POLICY "Public can view slots" ON slots
  FOR SELECT USING (true);

CREATE POLICY "Public can create slots" ON slots
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update slots" ON slots
  FOR UPDATE USING (true);

CREATE POLICY "Public can view bookings" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update bookings" ON bookings
  FOR UPDATE USING (true);

CREATE POLICY "Public can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view audit logs" ON audit_logs
  FOR SELECT USING (true);