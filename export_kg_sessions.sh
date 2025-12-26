#!/bin/bash
# Export KG sessions from local DB with correct module_id for production

echo "-- Production Kindergarten Sessions (Module ID 1)"
echo "-- My Robot Friends - KG Robotics"
echo ""
echo "DELETE FROM curriculum_sessions WHERE module_id = 1; -- Clean existing KG sessions"
echo ""

# Export sessions from local DB (module_id 2) to production format (module_id 1)
npx wrangler d1 execute passionbots-lms-production --local --command="
SELECT 
  '(1, ' || session_number || ', ''' || REPLACE(title, '''', '''''') || ''', ''' || 
  REPLACE(description, '''', '''''') || ''', ''' || objectives || ''', ' || 
  duration_minutes || ', ' || is_project || ', ' || order_number || ', ''' || 
  REPLACE(content, '''', '''''') || '''),'
FROM curriculum_sessions 
WHERE module_id = 2
ORDER BY session_number
" 2>/dev/null | grep -E '^\(1,' | sed 's/^/  /'

