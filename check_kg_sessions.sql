-- Production KG Session Fix
-- The production DB only has 12 KG sessions but should have 48
-- This script will check for missing KG sessions and provide instructions

-- First, let's see what we have
SELECT 'Current KG sessions:' as status, COUNT(*) as count FROM curriculum_sessions WHERE module_id = 1;

-- Show existing sessions
SELECT session_number, title FROM curriculum_sessions WHERE module_id = 1 ORDER BY session_number;

--  NOTE: Production database is missing 36 KG sessions (has 12, needs 48)
-- The complete KG curriculum was deployed to local but not production
-- 
-- Solution: Export from local DB and import to production
-- Run these commands:
--
-- 1. Export from local:
-- npx wrangler d1 execute passionbots-lms-production --local --command="
--   SELECT * FROM curriculum_sessions WHERE module_id = 2 
--   " > local_kg_sessions.json
--
-- 2. Create SQL insert statements with correct module_id (1 instead of 2)
-- 
-- 3. Import to production:
-- npx wrangler d1 execute passionbots-lms-production --remote --file=production_kg_sessions_complete.sql
