import { supabase } from './supabaseClient';

export interface KnowledgeBaseFile {
  id: string;
  user_id: string;
  agent_id: string;
  file_name: string;
  file_type: 'pdf' | 'txt' | 'docx';
  file_size_bytes: number;
  file_size_formatted: string;
  upload_date: string;
  status: 'uploading' | 'processing' | 'trained' | 'failed';
  error_message?: string;
  n8n_file_id?: string;
  file_url?: string; // Supabase file URL for preview
  processing_progress: number;
  created_at: string;
  updated_at: string;
}

export interface CreateKnowledgeBaseFileData {
  user_id: string;
  agent_id: string;
  file_name: string;
  file_type: 'pdf' | 'txt' | 'docx';
  file_size_bytes: number;
  file_size_formatted: string;
}

export interface UpdateKnowledgeBaseFileData {
  status?: 'uploading' | 'processing' | 'trained' | 'failed';
  error_message?: string;
  n8n_file_id?: string;
  file_url?: string; // Supabase file URL
  processing_progress?: number;
}

// Get all knowledge base files for a user
export const getKnowledgeBaseFiles = async (userId: string): Promise<KnowledgeBaseFile[]> => {
  const { data, error } = await supabase
    .from('knowledge_base_files')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching knowledge base files:', error);
    throw error;
  }

  return data || [];
};

// Create a new knowledge base file record
export const createKnowledgeBaseFile = async (fileData: CreateKnowledgeBaseFileData): Promise<KnowledgeBaseFile> => {
  console.log("📝 Creating knowledge base file record...");
  console.log("File data:", fileData);
  
  const { data, error } = await supabase
    .from('knowledge_base_files')
    .insert(fileData)
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating knowledge base file:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }

  console.log("✅ Knowledge base file record created successfully:", data);
  return data;
};

// Update a knowledge base file
export const updateKnowledgeBaseFile = async (
  fileId: string, 
  updates: UpdateKnowledgeBaseFileData
): Promise<KnowledgeBaseFile> => {
  console.log("📝 Updating knowledge base file...");
  console.log("File ID:", fileId);
  console.log("Updates:", updates);
  
  const { data, error } = await supabase
    .from('knowledge_base_files')
    .update(updates)
    .eq('id', fileId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error updating knowledge base file:', error);
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }

  console.log("✅ Knowledge base file updated successfully:", data);
  return data;
};

// Delete a knowledge base file
export const deleteKnowledgeBaseFile = async (fileId: string): Promise<void> => {
  const { error } = await supabase
    .from('knowledge_base_files')
    .delete()
    .eq('id', fileId);

  if (error) {
    console.error('Error deleting knowledge base file:', error);
    throw error;
  }
};

// Get knowledge base statistics for a user
export const getKnowledgeBaseStats = async (userId: string) => {
  const files = await getKnowledgeBaseFiles(userId);
  
  const stats = {
    total: files.length,
    trained: files.filter(f => f.status === 'trained').length,
    processing: files.filter(f => f.status === 'processing').length,
    uploading: files.filter(f => f.status === 'uploading').length,
    failed: files.filter(f => f.status === 'failed').length,
    totalSize: files.reduce((acc, f) => acc + f.file_size_bytes, 0),
    byType: {
      pdf: files.filter(f => f.file_type === 'pdf').length,
      txt: files.filter(f => f.file_type === 'txt').length,
      docx: files.filter(f => f.file_type === 'docx').length,
    }
  };

  return { files, stats };
};

// Check if file already exists for user
export const checkFileExists = async (
  userId: string, 
  fileName: string, 
  fileSizeBytes: number
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('knowledge_base_files')
    .select('id')
    .eq('user_id', userId)
    .eq('file_name', fileName)
    .eq('file_size_bytes', fileSizeBytes)
    .limit(1);

  if (error) {
    console.error('Error checking file existence:', error);
    return false;
  }

  return (data && data.length > 0) || false;
};
