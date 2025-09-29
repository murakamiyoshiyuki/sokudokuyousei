-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Slotsテーブル（レッスン枠）
CREATE TABLE IF NOT EXISTS slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  max_attendees INTEGER DEFAULT 1,
  provider_id VARCHAR(255) NOT NULL,
  zoom_url TEXT,
  exam_type VARCHAR(20) DEFAULT 'provisional' CHECK (exam_type IN ('provisional', 'final')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Attendeesテーブル（参加者）
CREATE TABLE IF NOT EXISTS attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id UUID NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  attendee_name VARCHAR(100) NOT NULL,
  attendee_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slot_id, attendee_id)
);

-- インデックス
CREATE INDEX idx_slots_date ON slots(date);
CREATE INDEX idx_slots_provider_id ON slots(provider_id);
CREATE INDEX idx_attendees_slot_id ON attendees(slot_id);

-- RLS (Row Level Security) を有効化
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;

-- すべてのユーザーがデータを読み書きできるポリシー
CREATE POLICY "Public can read slots" ON slots
  FOR SELECT USING (true);

CREATE POLICY "Public can insert slots" ON slots
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update slots" ON slots
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete slots" ON slots
  FOR DELETE USING (true);

CREATE POLICY "Public can read attendees" ON attendees
  FOR SELECT USING (true);

CREATE POLICY "Public can insert attendees" ON attendees
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can delete attendees" ON attendees
  FOR DELETE USING (true);