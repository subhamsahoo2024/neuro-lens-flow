-- Remove unnecessary columns from visits table
ALTER TABLE visits 
DROP COLUMN IF EXISTS epwv_recommendations,
DROP COLUMN IF EXISTS height,
DROP COLUMN IF EXISTS weight;