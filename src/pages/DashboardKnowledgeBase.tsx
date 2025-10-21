import React, { useState, useCallback } from 'react';
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
  Globe
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DashboardKnowledgeBase: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([
    {
      id: 1,
      name: "Neodynatech Solutions Inc.'s Knowledge Base",
      type: 'Text',
      size: '50.0 KB',
      date: '17/08/2025',
      status: 'Trained'
    }
  ]);

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload here
      console.log(e.dataTransfer.files);
    }
  }, []);

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'txt':
      case 'text':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'docx':
      case 'word':
        return <File className="h-5 w-5 text-blue-600" />;
      case 'html':
        return <FileCode className="h-5 w-5 text-orange-500" />;
      case 'epub':
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Trained':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Trained</Badge>;
      case 'Processing':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Processing</Badge>;
      case 'Failed':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
        <p className="text-muted-foreground mt-1">
          Upload documents to train Benny with your organization's knowledge.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Upload Documents */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Upload Documents</CardTitle>
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, TXT, DOCX, HTML, EPUB
              </p>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Drag & drop files here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                <Button variant="outline">
                  Choose Files
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Files will be processed and made available for training Benny.
              </p>
            </CardContent>
          </Card>

          {/* Training Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Training Status</CardTitle>
              <p className="text-sm text-muted-foreground">
                Documents used to enhance Benny's knowledge
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Documents processed</span>
                <span className="text-2xl font-bold">1</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Processing</span>
                <span className="text-2xl font-bold">0</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t pt-4">
                <span className="text-sm text-muted-foreground">Storage used</span>
                <span className="text-lg font-bold">50.0 KB</span>
              </div>

              <Button variant="outline" className="w-full mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Training
              </Button>
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
                <TabsList className="grid grid-cols-6 w-full mb-6">
                  <TabsTrigger value="all" className="text-xs">
                    All Documents
                  </TabsTrigger>
                  <TabsTrigger value="pdf" className="text-xs">
                    PDF <span className="ml-1">0</span>
                  </TabsTrigger>
                  <TabsTrigger value="text" className="text-xs">
                    Text <span className="ml-1">1</span>
                  </TabsTrigger>
                  <TabsTrigger value="word" className="text-xs">
                    Word <span className="ml-1">0</span>
                  </TabsTrigger>
                  <TabsTrigger value="html" className="text-xs">
                    HTML <span className="ml-1">0</span>
                  </TabsTrigger>
                  <TabsTrigger value="epub" className="text-xs">
                    EPUB <span className="ml-1">0</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <h4 className="font-medium text-sm">{file.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {file.type} • {file.size} • {file.date}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {getStatusBadge(file.status)}
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="pdf">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">No PDF documents uploaded yet.</p>
                  </div>
                </TabsContent>

                <TabsContent value="text">
                  {files.filter(f => f.type.toLowerCase() === 'text').map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <h4 className="font-medium text-sm">{file.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {file.type} • {file.size} • {file.date}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {getStatusBadge(file.status)}
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="word">
                  <div className="text-center py-8">
                    <File className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">No Word documents uploaded yet.</p>
                  </div>
                </TabsContent>

                <TabsContent value="html">
                  <div className="text-center py-8">
                    <FileCode className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">No HTML documents uploaded yet.</p>
                  </div>
                </TabsContent>

                <TabsContent value="epub">
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">No EPUB documents uploaded yet.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
