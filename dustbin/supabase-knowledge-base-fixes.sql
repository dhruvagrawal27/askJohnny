-- ===================================================
-- KNOWLEDGE BASE FIXES - RUN THIS IN SUPABASE SQL EDITOR
-- ===================================================

-- 1. Fix Knowledge Base Files RLS Policies
-- Drop existing policies that require JWT authentication
DROP POLICY IF EXISTS "Users can view their own knowledge base files" ON knowledge_base_files;
DROP POLICY IF EXISTS "Users can insert their own knowledge base files" ON knowledge_base_files;
DROP POLICY IF EXISTS "Users can update their own knowledge base files" ON knowledge_base_files;
DROP POLICY IF EXISTS "Users can delete their own knowledge base files" ON knowledge_base_files;

-- For now, disable RLS entirely since we're not using Supabase auth
-- The application will handle user authorization at the service layer
ALTER TABLE knowledge_base_files DISABLE ROW LEVEL SECURITY;

-- 2. Add file_url column to store Supabase file URLs for preview
ALTER TABLE knowledge_base_files ADD COLUMN IF NOT EXISTS file_url TEXT;

-- ===================================================
-- END OF SCRIPT
-- ===================================================
