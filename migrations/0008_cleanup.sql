-- Drop and recreate advanced feature tables
PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS quizzes;
DROP TABLE IF EXISTS assignment_submissions;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS certificates;

PRAGMA foreign_keys = ON;
