-- Knowledge Base Files Table
CREATE TABLE knowledge_base_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Clerk user ID
  agent_id TEXT NOT NULL, -- VAPI agent ID
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'txt', 'docx')),
  file_size_bytes BIGINT NOT NULL,
  file_size_formatted TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'trained', 'failed')),
  error_message TEXT,
  n8n_file_id TEXT, -- File ID returned from N8N webhook
  processing_progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX idx_knowledge_base_files_user_id ON knowledge_base_files(user_id);
CREATE INDEX idx_knowledge_base_files_agent_id ON knowledge_base_files(agent_id);
CREATE INDEX idx_knowledge_base_files_status ON knowledge_base_files(status);

-- RLS (Row Level Security) policies
ALTER TABLE knowledge_base_files ENABLE ROW LEVEL SECURITY;

-- Users can only see their own files
CREATE POLICY "Users can view their own knowledge base files" ON knowledge_base_files
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

-- Users can insert their own files
CREATE POLICY "Users can insert their own knowledge base files" ON knowledge_base_files
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Users can update their own files
CREATE POLICY "Users can update their own knowledge base files" ON knowledge_base_files
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

-- Users can delete their own files
CREATE POLICY "Users can delete their own knowledge base files" ON knowledge_base_files
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_knowledge_base_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_knowledge_base_files_updated_at
  BEFORE UPDATE ON knowledge_base_files
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_files_updated_at();
