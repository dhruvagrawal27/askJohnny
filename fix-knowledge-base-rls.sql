-- Fix Knowledge Base Files RLS Policies
-- Drop existing policies that require JWT authentication
DROP POLICY IF EXISTS "Users can view their own knowledge base files" ON knowledge_base_files;
DROP POLICY IF EXISTS "Users can insert their own knowledge base files" ON knowledge_base_files;
DROP POLICY IF EXISTS "Users can update their own knowledge base files" ON knowledge_base_files;
DROP POLICY IF EXISTS "Users can delete their own knowledge base files" ON knowledge_base_files;

-- For now, disable RLS entirely since we're not using Supabase auth
-- The application will handle user authorization at the service layer
ALTER TABLE knowledge_base_files DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled but allow all operations
-- (since authorization is handled at the application level)
-- ALTER TABLE knowledge_base_files ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations on knowledge_base_files" ON knowledge_base_files FOR ALL USING (true);
