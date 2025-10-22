import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  Eye, 
  Trash2, 
  RefreshCw,
  File,
  FileCode,
  FileSpreadsheet,
  Globe,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUser } from "@clerk/clerk-react";
import { fetchUserByClerkId } from "../lib/dataService";
import { 
  KnowledgeBaseFile,
  getKnowledgeBaseFiles,
  createKnowledgeBaseFile,
  updateKnowledgeBaseFile,
  deleteKnowledgeBaseFile,
  checkFileExists
} from "../lib/knowledgeBaseService";

// File interface for staged files (before upload)
interface StagedFile {
  id: string;
  file: File;
  name: string;
  type: 'pdf' | 'txt' | 'docx';
  size: string;
  sizeBytes: number;
  date: string;
}

export const DashboardKnowledgeBase: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<KnowledgeBaseFile[]>([]);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]); // Files waiting to be uploaded
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<KnowledgeBaseFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isLoaded, isSignedIn, user } = useUser();

  // Fetch agent ID and load files
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded || !isSignedIn || !user) return;
      
      setIsLoading(true);
      try {
        // Fetch user data for agent ID
        const userData = await fetchUserByClerkId(user.id);
        const fetchedAgentId = (userData as any)?.agent_id ?? null;
        setAgentId(fetchedAgentId);
        console.log("Agent ID loaded:", fetchedAgentId);

        // Load files from Supabase
        await loadFiles();
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isLoaded, isSignedIn, user]);

  // Refresh data when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log("Page became visible, refreshing data...");
        loadFiles();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Load files from Supabase
  const loadFiles = async () => {
    if (!user) return;
    
    try {
      const userFiles = await getKnowledgeBaseFiles(user.id);
      setFiles(userFiles);
      console.log("Loaded files from Supabase:", userFiles);
    } catch (error) {
      console.error("Error loading files:", error);
    }
  };

  // Refresh files data
  const refreshFiles = async () => {
    await loadFiles();
  };

  // Fix existing processing files (temporary function)
  const fixProcessingFiles = async () => {
    if (!user) return;
    
    try {
      console.log("Fixing existing processing files...");
      
      // Your latest webhook response data
      const webhookResponseData = {
        "fileId_0": "3cc2e284-7f05-45be-970f-152f3f5de099",
        "fileName_0": "Experiment 5.docx.pdf",
        "fileUrl_0": "https://jtuyprjjgxbgmtjiykoa.supabase.co/storage/v1/object/public/files/1761164939327-0b74b8c5-f6ad-44d4-987c-0d29ed12e7d7.pdf",
        "fileId_1": "4b0ca94e-038b-41a1-9328-5b29f5ae1a59",
        "fileName_1": "Experiment 6.docx.pdf",
        "fileUrl_1": "https://jtuyprjjgxbgmtjiykoa.supabase.co/storage/v1/object/public/files/1761164940476-752b4f33-90e9-46be-b8b6-3c1fc45e3eb0.pdf"
      };
      
      // Update files based on name matching
      const processingFiles = files.filter(f => f.status === 'processing');
      
      for (const file of processingFiles) {
        let fileUrl = null;
        let n8nFileId = null;
        
        // Match by filename
        if (file.file_name === "Experiment 5.docx.pdf") {
          fileUrl = webhookResponseData.fileUrl_0;
          n8nFileId = webhookResponseData.fileId_0;
        } else if (file.file_name === "Experiment 6.docx.pdf") {
          fileUrl = webhookResponseData.fileUrl_1;
          n8nFileId = webhookResponseData.fileId_1;
        }
        
        if (fileUrl) {
          console.log(`Updating ${file.file_name} with URL: ${fileUrl}`);
          await updateKnowledgeBaseFile(file.id, {
            status: 'trained',
            file_url: fileUrl,
            n8n_file_id: n8nFileId,
            processing_progress: 100
          });
          console.log(`✅ Updated ${file.file_name} to trained with URL`);
        } else {
          // Just mark as trained if no URL match found
          await updateKnowledgeBaseFile(file.id, {
            status: 'trained',
            processing_progress: 100
          });
          console.log(`✅ Updated ${file.file_name} to trained status`);
        }
      }
      
      // Refresh the list
      await loadFiles();
      console.log("✅ All processing files have been fixed");
    } catch (error) {
      console.error("Error fixing processing files:", error);
    }
  };

  // Allowed file types
  const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExtensions = ['.pdf', '.txt', '.docx'];

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Get file type from file
  const getFileType = (file: File): 'pdf' | 'txt' | 'docx' => {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type === 'text/plain') return 'txt';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
    
    // Fallback to extension
    const extension = file.name.toLowerCase().split('.').pop();
    if (extension === 'pdf') return 'pdf';
    if (extension === 'txt') return 'txt';
    if (extension === 'docx') return 'docx';
    
    return 'txt'; // default fallback
  };

  // Validate file
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const extension = '.' + file.name.toLowerCase().split('.').pop();
      if (!allowedExtensions.includes(extension)) {
        return { valid: false, error: 'Only PDF, TXT, and DOCX files are allowed.' };
      }
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB.' };
    }

    return { valid: true };
  };

  // Upload multiple files to N8N webhook in a single batch request
  const uploadFilesToN8NBatch = async (fileRecords: Array<{record: any, stagedFile: StagedFile}>): Promise<boolean> => {
    if (!agentId) {
      console.error("❌ No agent ID available for batch upload");
      return false;
    }

    try {
      console.log(`📤 Starting N8N batch upload for ${fileRecords.length} files`);
      
      // Create FormData with all files and metadata (like outbound calls pattern)
      const formData = new FormData();
      
      // Add agent metadata
      formData.append('agentId', agentId);
      formData.append('userId', user!.id);
      formData.append('source', 'knowledge_base');
      formData.append('fileCount', fileRecords.length.toString());
      
      // Add each file with its metadata
      fileRecords.forEach(({ record, stagedFile }, index) => {
        console.log(`Adding file ${index + 1}/${fileRecords.length}: ${stagedFile.name}`);
        
        // Add the actual file
        formData.append('files', stagedFile.file, stagedFile.name);
        
        // Add metadata for each file
        formData.append(`fileId_${index}`, record.id);
        formData.append(`fileName_${index}`, stagedFile.name);
        formData.append(`fileType_${index}`, stagedFile.type);
        formData.append(`fileSize_${index}`, stagedFile.sizeBytes.toString());
      });

      console.log("FormData created with all files, making batch request to N8N webhook...");
      console.log("Webhook URL:", 'https://dhruvthc.app.n8n.cloud/webhook/fileupload');
      console.log("Files being uploaded:", fileRecords.map(fr => fr.stagedFile.name));

      const response = await fetch('https://dhruvthc.app.n8n.cloud/webhook/fileupload', {
        method: 'POST',
        body: formData,
      });

      console.log("N8N Batch Response status:", response.status);
      console.log("N8N Batch Response headers:", Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('✅ N8N Batch Upload successful:', result);
        
        // Process the webhook response to update files with URLs and trained status
        if (Array.isArray(result) && result.length > 0) {
          const webhookData = result[0]; // Get the response object
          console.log("Processing webhook response data:", webhookData);
          
          // Update each file with its URL and set status to trained
          // Note: We match by index since webhook response uses fileId_0, fileId_1, etc.
          for (let i = 0; i < fileRecords.length; i++) {
            const { record } = fileRecords[i];
            const fileUrl = webhookData[`fileUrl_${i}`];
            const webhookFileId = webhookData[`fileId_${i}`]; // This is different from our DB record ID
            const fileName = webhookData[`fileName_${i}`];
            
            console.log(`Processing file ${i}: ${fileName}`);
            console.log(`Database record ID: ${record.id}`);
            console.log(`Webhook file ID: ${webhookFileId}`);
            console.log(`File URL: ${fileUrl}`);
            
            if (fileUrl) {
              console.log(`Updating database record ${record.id} with URL: ${fileUrl}`);
              try {
                const updatedFile = await updateKnowledgeBaseFile(record.id, {
                  status: 'trained',
                  file_url: fileUrl,
                  n8n_file_id: webhookFileId, // Store webhook's file ID for reference
                  processing_progress: 100
                });
                console.log(`✅ File ${record.file_name} updated to trained with URL:`, updatedFile);
              } catch (updateError) {
                console.error(`❌ Failed to update file ${record.file_name}:`, updateError);
                console.error('Update error details:', updateError);
                // Try updating just the status if URL update fails
                try {
                  await updateKnowledgeBaseFile(record.id, {
                    status: 'trained',
                    processing_progress: 100
                  });
                  console.log(`✅ Fallback: Updated ${record.file_name} to trained status only`);
                } catch (fallbackError) {
                  console.error(`❌ Even fallback update failed for ${record.file_name}:`, fallbackError);
                }
              }
            } else {
              console.warn(`No URL found for file ${record.file_name}, setting to trained anyway`);
              await updateKnowledgeBaseFile(record.id, {
                status: 'trained',
                processing_progress: 100
              });
            }
          }
        } else {
          console.warn("Unexpected webhook response format, setting files to processing");
          // Fallback: set all files to processing
          for (const { record } of fileRecords) {
            await updateKnowledgeBaseFile(record.id, {
              status: 'processing',
              processing_progress: 100
            });
          }
        }
        
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ N8N Batch Upload failed:');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Response Body:', errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ N8N Batch Upload error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return false;
    }
  };

  // Upload file to N8N webhook (single file - kept for compatibility)
  const uploadFileToN8N = async (file: File, fileId: string): Promise<boolean> => {
    if (!agentId) {
      console.error("❌ No agent ID available for upload");
      return false;
    }

    try {
      console.log(`📤 Starting N8N upload for file: ${file.name}`);
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
      console.log("Upload parameters:", {
        fileId: fileId,
        agentId: agentId,
        fileName: file.name,
        fileType: getFileType(file)
      });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('agentId', agentId);
      formData.append('fileName', file.name);
      formData.append('fileType', getFileType(file));
      formData.append('fileId', fileId);

      console.log("FormData created, making request to N8N webhook...");
      console.log("Webhook URL:", 'https://dhruvthc.app.n8n.cloud/webhook/fileupload');

      const response = await fetch('https://dhruvthc.app.n8n.cloud/webhook/fileupload', {
        method: 'POST',
        body: formData,
      });

      console.log("N8N Response status:", response.status);
      console.log("N8N Response headers:", Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('✅ N8N Upload successful:', result);
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ N8N Upload failed:');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Response Body:', errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ N8N Upload error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return false;
    }
  };

  // Process uploaded files - just stage them, don't upload yet
  const processFiles = async (fileList: FileList | File[]) => {
    if (!user) {
      alert("Please wait for user data to load before selecting files.");
      return;
    }

    const filesToProcess = Array.from(fileList);
    const newStagedFiles: StagedFile[] = [];
    const invalidFiles: string[] = [];

    // Validate all files first
    for (const file of filesToProcess) {
      const validation = validateFile(file);
      if (!validation.valid) {
        invalidFiles.push(`${file.name}: ${validation.error}`);
        continue;
      }

      // Check for duplicates in staged files
      const existingStaged = stagedFiles.find(f => f.name === file.name && f.sizeBytes === file.size);
      if (existingStaged) {
        invalidFiles.push(`${file.name}: File already staged for upload`);
        continue;
      }

      // Check for duplicates in uploaded files
      const fileExists = await checkFileExists(user.id, file.name, file.size);
      if (fileExists) {
        invalidFiles.push(`${file.name}: File already exists in knowledge base`);
        continue;
      }

      const stagedFileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newStagedFile: StagedFile = {
        id: stagedFileId,
        file: file,
        name: file.name,
        type: getFileType(file),
        size: formatFileSize(file.size),
        sizeBytes: file.size,
        date: new Date().toLocaleDateString('en-GB')
      };

      newStagedFiles.push(newStagedFile);
    }

    // Show errors for invalid files
    if (invalidFiles.length > 0) {
      alert(`Some files could not be processed:\n\n${invalidFiles.join('\n')}`);
    }

    if (newStagedFiles.length === 0) return;

    // Add files to staged state
    setStagedFiles(prev => [...prev, ...newStagedFiles]);
  };

  // Upload all staged files to N8N and Supabase in a single batch
  const uploadStagedFiles = async () => {
    if (!agentId || !user || stagedFiles.length === 0) {
      alert("No files to upload or user data not loaded.");
      return;
    }

    console.log("Starting batch upload process...");
    console.log("Agent ID:", agentId);
    console.log("User ID:", user.id);
    console.log("Staged files:", stagedFiles);

    setIsUploading(true);

    try {
      // Create database records for all files first
      console.log("Creating database records for all files...");
      const fileRecords = [];
      
      for (const stagedFile of stagedFiles) {
        console.log(`Creating database record for: ${stagedFile.name}`);
        const fileRecord = await createKnowledgeBaseFile({
          user_id: user.id,
          agent_id: agentId,
          file_name: stagedFile.name,
          file_type: stagedFile.type,
          file_size_bytes: stagedFile.sizeBytes,
          file_size_formatted: stagedFile.size
        });
        fileRecords.push({ record: fileRecord, stagedFile });
        console.log(`✅ Database record created for ${stagedFile.name}:`, fileRecord.id);
      }

      // Upload all files to N8N in a single batch request (like outbound calls)
      console.log("Uploading all files to N8N in single batch...");
      const success = await uploadFilesToN8NBatch(fileRecords);

      if (success) {
        console.log(`✅ All ${stagedFiles.length} files uploaded successfully to N8N`);
        // Files are now trained and have URLs - status will be updated in uploadFilesToN8NBatch
      } else {
        console.log(`❌ Batch upload to N8N failed`);
        // Update all files status to failed
        for (const { record } of fileRecords) {
          await updateKnowledgeBaseFile(record.id, { 
            status: 'failed',
            error_message: 'Batch upload to N8N failed' 
          });
          console.log(`❌ File ${record.file_name} status updated to failed`);
        }
      }

    } catch (error) {
      console.error(`❌ Error during batch upload process:`, error);
      // Update any created records to failed status
      alert(`Upload failed: ${error.message}`);
    }

    console.log("Batch upload process completed");
    
    // Clear staged files after upload
    setStagedFiles([]);
    setIsUploading(false);
    
    // Refresh files list
    console.log("Refreshing files list...");
    await loadFiles();
  };
  // Preview file function
  const previewFileHandler = (file: KnowledgeBaseFile) => {
    if (file.file_url && file.status === 'trained') {
      setPreviewFile(file);
      setIsPreviewOpen(true);
    } else {
      alert('File is not ready for preview yet. Please wait for processing to complete.');
    }
  };

  // Close preview modal
  const closePreview = () => {
    setPreviewFile(null);
    setIsPreviewOpen(false);
  };

  // Remove staged file
  // Remove staged file
  const removeStagedFile = (fileId: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [agentId, files]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input value to allow same file selection
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Remove file
  const removeFile = async (fileId: string) => {
    try {
      await deleteKnowledgeBaseFile(fileId);
      await loadFiles(); // Refresh the list
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  // Retry failed upload (Note: This would need the original file, which we don't store)
  const retryUpload = async (fileId: string) => {
    // For now, just show a message that they need to re-upload
    alert('Please re-upload the file to retry.');
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'txt':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'docx':
        return <File className="h-5 w-5 text-blue-600" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'trained':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Trained</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Processing</Badge>;
      case 'uploading':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Uploading</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'trained':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'uploading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Calculate stats
  const stats = {
    total: files.length + stagedFiles.length,
    trained: files.filter(f => f.status === 'trained').length,
    processing: files.filter(f => f.status === 'processing').length,
    uploading: files.filter(f => f.status === 'uploading').length,
    failed: files.filter(f => f.status === 'failed').length,
    staged: stagedFiles.length,
    totalSize: files.reduce((acc, f) => acc + f.file_size_bytes, 0) + stagedFiles.reduce((acc, f) => acc + f.sizeBytes, 0),
    byType: {
      pdf: files.filter(f => f.file_type === 'pdf').length + stagedFiles.filter(f => f.type === 'pdf').length,
      txt: files.filter(f => f.file_type === 'txt').length + stagedFiles.filter(f => f.type === 'txt').length,
      docx: files.filter(f => f.file_type === 'docx').length + stagedFiles.filter(f => f.type === 'docx').length,
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
        <p className="text-muted-foreground mt-1">
          Upload documents to train your AI assistant with your organization's knowledge.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.docx"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Upload Documents */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Upload Documents</CardTitle>
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, TXT, DOCX (Max 10MB per file)
              </p>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFilePicker}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Drag & drop files here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                <Button variant="outline" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Choose Files'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Files will be processed and made available for training your AI assistant.
              </p>
            </CardContent>
          </Card>

          {/* Training Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Training Status</CardTitle>
              <p className="text-sm text-muted-foreground">
                Documents used to enhance your AI assistant's knowledge
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Documents processed</span>
                <span className="text-2xl font-bold">{stats.trained}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Processing</span>
                <span className="text-2xl font-bold">{stats.processing + stats.uploading}</span>
              </div>

              {stats.staged > 0 && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Ready to upload</span>
                  <span className="text-2xl font-bold text-blue-600">{stats.staged}</span>
                </div>
              )}

              {stats.failed > 0 && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Failed</span>
                  <span className="text-2xl font-bold text-red-600">{stats.failed}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between py-2 border-t pt-4">
                <span className="text-sm text-muted-foreground">Storage used</span>
                <span className="text-lg font-bold">{formatFileSize(stats.totalSize)}</span>
              </div>

              <div className="space-y-3">
                {/* Upload Staged Files Button */}
                {stagedFiles.length > 0 && (
                  <Button 
                    onClick={uploadStagedFiles}
                    disabled={isUploading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading {stagedFiles.length} file(s)...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {stagedFiles.length} file(s)
                      </>
                    )}
                  </Button>
                )}


              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Your Documents */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Your Documents</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage the documents in your knowledge base
              </p>
            </CardHeader>
            <CardContent>
              {/* Document Type Tabs */}
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-4 w-full mb-6">
                  <TabsTrigger value="all" className="text-xs">
                    All <span className="ml-1">({stats.total})</span>
                  </TabsTrigger>
                  <TabsTrigger value="pdf" className="text-xs">
                    PDF <span className="ml-1">({stats.byType.pdf})</span>
                  </TabsTrigger>
                  <TabsTrigger value="txt" className="text-xs">
                    TXT <span className="ml-1">({stats.byType.txt})</span>
                  </TabsTrigger>
                  <TabsTrigger value="docx" className="text-xs">
                    DOCX <span className="ml-1">({stats.byType.docx})</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-spin" />
                      <p className="text-muted-foreground">Loading files...</p>
                    </div>
                  ) : files.length === 0 && stagedFiles.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-muted-foreground">No documents uploaded yet.</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload your first document to get started.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Show staged files (waiting to be uploaded) */}
                      {stagedFiles.map((stagedFile) => (
                        <div
                          key={stagedFile.id}
                          className="flex items-center justify-between p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {getFileIcon(stagedFile.type)}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{stagedFile.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {stagedFile.type.toUpperCase()} • {stagedFile.size} • Ready to upload
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Upload className="h-4 w-4 text-blue-500" />
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Staged</Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                onClick={() => removeStagedFile(stagedFile.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Show uploaded files */}
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {getFileIcon(file.file_type)}
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{file.file_name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {file.file_type.toUpperCase()} • {file.file_size_formatted} • {formatDate(file.upload_date)}
                              </p>
                              {file.error_message && (
                                <p className="text-xs text-red-500 mt-1">{file.error_message}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(file.status)}
                              {getStatusBadge(file.status)}
                            </div>
                            <div className="flex items-center gap-1">
                              {file.status === 'failed' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                                  onClick={() => retryUpload(file.id)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                              {file.status === 'trained' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => previewFileHandler(file)}
                                  title="Preview document"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                onClick={() => removeFile(file.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </TabsContent>

                {/* Individual file type tabs */}
                {['pdf', 'txt', 'docx'].map(type => (
                  <TabsContent key={type} value={type}>
                    {files.filter(f => f.file_type === type).length === 0 && stagedFiles.filter(f => f.type === type).length === 0 ? (
                      <div className="text-center py-8">
                        {getFileIcon(type)}
                        <p className="text-muted-foreground mt-4">
                          No {type.toUpperCase()} documents uploaded yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Show staged files for this type */}
                        {stagedFiles.filter(f => f.type === type).map((stagedFile) => (
                          <div
                            key={stagedFile.id}
                            className="flex items-center justify-between p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {getFileIcon(stagedFile.type)}
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{stagedFile.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {stagedFile.size} • Ready to upload
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Upload className="h-4 w-4 text-blue-500" />
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Staged</Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  onClick={() => removeStagedFile(stagedFile.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Show uploaded files for this type */}
                        {files.filter(f => f.file_type === type).map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {getFileIcon(file.file_type)}
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{file.file_name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {file.file_size_formatted} • {formatDate(file.upload_date)}
                                </p>
                                {file.error_message && (
                                  <p className="text-xs text-red-500 mt-1">{file.error_message}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(file.status)}
                                {getStatusBadge(file.status)}
                              </div>
                              <div className="flex items-center gap-1">
                                {file.status === 'failed' && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700"
                                    onClick={() => retryUpload(file.id)}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                )}
                                {file.status === 'trained' && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => previewFileHandler(file)}
                                    title="Preview document"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  onClick={() => removeFile(file.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* File Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={(open) => {
        if (!open) {
          closePreview();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Preview: {previewFile?.file_name}</DialogTitle>
          </DialogHeader>
          
          {previewFile && previewFile.file_url && (
            <div className="w-full h-[calc(90vh-100px)] overflow-hidden">
              {previewFile.file_type === 'pdf' ? (
                // PDF Preview
                <iframe
                  src={previewFile.file_url}
                  className="w-full h-full border-0 rounded"
                  title={`Preview of ${previewFile.file_name}`}
                />
              ) : previewFile.file_type === 'txt' ? (
                // Text file preview - fetch and display content
                <div className="w-full h-full overflow-auto p-4 bg-gray-50 rounded border">
                  <pre className="whitespace-pre-wrap text-sm">
                    {/* We'll need to fetch the text content */}
                    <iframe
                      src={previewFile.file_url}
                      className="w-full h-full border-0"
                      title={`Preview of ${previewFile.file_name}`}
                    />
                  </pre>
                </div>
              ) : previewFile.file_type === 'docx' ? (
                // DOCX Preview - show download message since browsers can't preview DOCX directly
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50 rounded border">
                  <File className="h-16 w-16 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Word Document Preview</h3>
                  <p className="text-muted-foreground mb-4 text-center">
                    Word documents cannot be previewed directly in the browser.
                  </p>
                  <Button 
                    onClick={() => window.open(previewFile.file_url, '_blank')}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download & Open
                  </Button>
                </div>
              ) : (
                // Fallback for other file types
                <div className="w-full h-full flex items-center justify-center p-8">
                  <p className="text-muted-foreground">Preview not available for this file type.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
