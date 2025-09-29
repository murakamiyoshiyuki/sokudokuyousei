-- Add exam_type column to slots table
ALTER TABLE slots
ADD COLUMN exam_type VARCHAR(20) DEFAULT 'provisional'
CHECK (exam_type IN ('provisional', 'final'));

-- Update existing records to have provisional type
UPDATE slots
SET exam_type = 'provisional'
WHERE exam_type IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE slots
ALTER COLUMN exam_type SET NOT NULL;