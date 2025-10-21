import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  ConnectionLineType,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  ChevronDown, 
  Edit, 
  Trash2,
  Lightbulb,
  MessageSquare,
  ArrowRight,
  Phone,
  User
} from 'lucide-react';

// Custom Node Component
const CustomNode = ({ data, selected }: any) => {
  return (
    <div className={`px-4 py-3 rounded-lg border-2 bg-white min-w-48 ${
      selected ? 'border-blue-500' : 'border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {data.icon}
          <span className="font-medium text-sm">{data.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <Edit className="h-3 w-3 text-gray-400" />
          <Trash2 className="h-3 w-3 text-gray-400" />
        </div>
      </div>
      {data.description && (
        <p className="text-xs text-gray-600 leading-tight">
          {data.description}
        </p>
      )}
    </div>
  );
};

export const DashboardCallPlanning: React.FC = () => {
  const [mode, setMode] = useState<'Visual Editor' | 'Preview' | 'JSON'>('Visual Editor');

  // Initial nodes with the exact flow from the image
  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'customNode',
      position: { x: 400, y: 50 },
      data: { 
        label: 'Start Call',
        description: 'Incoming call is received',
        icon: <Phone className="h-4 w-4 text-orange-500" />
      },
    },
    {
      id: '2',
      type: 'customNode',
      position: { x: 400, y: 180 },
      data: { 
        label: 'Play Greeting',
        description: 'Hello, thank you for calling. This is Benny, your virtual assistant.',
        icon: <MessageSquare className="h-4 w-4 text-green-500" />
      },
    },
    {
      id: '3',
      type: 'customNode',
      position: { x: 400, y: 310 },
      data: { 
        label: 'Ask Intent',
        description: 'Is there anything else I can help you with today?',
        icon: <Lightbulb className="h-4 w-4 text-blue-500" />
      },
    },
    {
      id: '4',
      type: 'customNode',
      position: { x: 150, y: 500 },
      data: { 
        label: 'Booking Flow',
        description: 'Okay, I can help with that. I\'ll send an appointment booking link to your phone shortly.',
        icon: <MessageSquare className="h-4 w-4 text-green-500" />
      },
    },
    {
      id: '5',
      type: 'customNode',
      position: { x: 650, y: 500 },
      data: { 
        label: 'Human Transfer',
        description: 'I\'ll connect you with one of our team members who can assist you further.',
        icon: <User className="h-4 w-4 text-orange-500" />
      },
    },
  ];

  const initialEdges: Edge[] = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'smoothstep',
      animated: true,
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
      type: 'smoothstep',
      animated: true,
    },
    {
      id: 'e3-4',
      source: '3',
      target: '4',
      type: 'smoothstep',
      label: 'Booking',
      labelStyle: { fontSize: 12, fontWeight: 500 },
      labelBgStyle: { fill: '#f3f4f6', color: '#374151' },
    },
    {
      id: 'e3-5',
      source: '3',
      target: '5',
      type: 'smoothstep',
      label: 'Human',
      labelStyle: { fontSize: 12, fontWeight: 500 },
      labelBgStyle: { fill: '#f3f4f6', color: '#374151' },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      customNode: CustomNode,
    }),
    []
  );

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: string, icon: React.ReactElement, color: string) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: 'customNode',
      position: { 
        x: Math.random() * 400 + 200, 
        y: Math.random() * 400 + 200 
      },
      data: { 
        label: type,
        description: `New ${type.toLowerCase()} node`,
        icon: React.cloneElement(icon, { className: `h-4 w-4 ${color}` })
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <Phone className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Call Flow Planning</h1>
          <p className="text-muted-foreground">Design how Benny handles calls</p>
        </div>
      </div>

      <div className="flex gap-6 h-[600px]">
        {/* Left Sidebar */}
        <div className="w-1/3 space-y-6">
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Phone className="h-5 w-5" />
                Call Flow Tools
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Design how Benny handles calls
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Generation */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-medium">AI Generation</span>
                  <Badge variant="secondary" className="text-xs">New</Badge>
                </div>
                <Button 
                  className="w-full bg-red-200 hover:bg-red-300 text-red-800 border-red-300"
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
              </div>

              {/* Node Types */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Node Types</span>
                  <span className="text-xs text-muted-foreground">Click to add</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center gap-1 h-auto py-3"
                    onClick={() => addNode('Decision', <Lightbulb />, 'text-blue-500')}
                  >
                    <Lightbulb className="h-4 w-4 text-blue-500" />
                    <span className="text-xs">Decision</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center gap-1 h-auto py-3"
                    onClick={() => addNode('Response', <MessageSquare />, 'text-green-500')}
                  >
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    <span className="text-xs">Response</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center gap-1 h-auto py-3"
                    onClick={() => addNode('Transfer', <ArrowRight />, 'text-orange-500')}
                  >
                    <ArrowRight className="h-4 w-4 text-orange-500" />
                    <span className="text-xs">Transfer</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-col items-center gap-1 h-auto py-3"
                    onClick={() => addNode('Trigger', <Phone />, 'text-red-500')}
                  >
                    <Phone className="h-4 w-4 text-red-500" />
                    <span className="text-xs">Trigger</span>
                  </Button>
                </div>
              </div>

              {/* Flow Actions */}
              <div>
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-medium">
                    <span>Flow Actions</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">(3 actions)</span>
                      <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
                    </div>
                  </summary>
                  <div className="mt-2 pl-4 space-y-1 text-sm text-muted-foreground">
                    <div>Action 1</div>
                    <div>Action 2</div>
                    <div>Action 3</div>
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Canvas Area */}
        <div className="w-2/3">
          <Card className="h-full bg-red-50 border-red-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-700">Default Call Flow</span>
                  <Badge variant="secondary" className="bg-red-200 text-red-700">
                    5 Nodes
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={mode === 'Visual Editor' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMode('Visual Editor')}
                  >
                    Visual Editor
                  </Button>
                  <Button
                    variant={mode === 'Preview' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMode('Preview')}
                  >
                    Preview
                  </Button>
                  <Button
                    variant={mode === 'JSON' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMode('JSON')}
                  >
                    JSON
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Design and visualize how Benny handles different call scenarios and edge cases
              </p>
            </CardHeader>
            <CardContent className="p-0 h-[500px]">
              {mode === 'Visual Editor' && (
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  connectionLineType={ConnectionLineType.SmoothStep}
                  fitView
                  className="bg-white rounded-b-lg"
                >
                  <Controls />
                  <MiniMap 
                    nodeColor="#ef4444"
                    className="bg-red-50"
                  />
                  <Background color="#f1f5f9" gap={16} />
                </ReactFlow>
              )}

              {mode === 'Preview' && (
                <div className="p-8 bg-white rounded-b-lg flex items-center justify-center h-full">
                  <div className="text-center">
                    <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Preview Mode</h3>
                    <p className="text-muted-foreground">
                      Call flow preview functionality coming soon
                    </p>
                  </div>
                </div>
              )}

              {mode === 'JSON' && (
                <div className="p-4 bg-white rounded-b-lg h-full overflow-auto">
                  <pre className="text-xs">
                    {JSON.stringify({ nodes, edges }, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
