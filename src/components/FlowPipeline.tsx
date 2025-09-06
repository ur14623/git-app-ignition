import { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Badge } from '@/components/ui/badge';

interface FlowPipelineProps {
  nodesData: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    scheduling: string;
    processed: number;
    errors: number;
    host: string;
    position: { x: number; y: number };
  }>;
}

// Custom node component
const CustomNode = ({ data }: { data: any }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "RUNNING": return "bg-success text-success-foreground border-success";
      case "STOPPED": return "bg-destructive text-destructive-foreground border-destructive";
      case "PARTIAL": return "bg-warning text-warning-foreground border-warning";
      default: return "bg-muted text-muted-foreground border-muted";
    }
  };

  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-card border-2 border-border min-w-[200px]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-sm">{data.name}</div>
          <Badge className={`text-xs ${getStatusColor(data.status)}`}>
            {data.status}
          </Badge>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {data.type}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {data.scheduling}
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            Processed: <span className="text-foreground font-medium">{data.processed.toLocaleString()}</span>
          </span>
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            Errors: <span className={`font-medium ${data.errors > 0 ? 'text-destructive' : 'text-success'}`}>
              {data.errors}
            </span>
          </span>
        </div>
        
        <div className="text-xs text-muted-foreground border-t pt-1">
          Host: {data.host}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export function FlowPipeline({ nodesData }: FlowPipelineProps) {
  // Convert mock data to React Flow format
  const initialNodes: Node[] = nodesData.map((node, index) => ({
    id: node.id,
    type: 'custom',
    position: { x: index * 280 + 50, y: 100 },
    data: {
      name: node.name,
      type: node.type,
      status: node.status,
      scheduling: node.scheduling,
      processed: node.processed,
      errors: node.errors,
      host: node.host,
    },
  }));

  // Create edges to connect nodes in sequence
  const initialEdges: Edge[] = nodesData.slice(0, -1).map((node, index) => ({
    id: `e${node.id}-${nodesData[index + 1].id}`,
    source: node.id,
    target: nodesData[index + 1].id,
    type: 'smoothstep',
    animated: true,
    style: {
      stroke: 'hsl(var(--primary))',
      strokeWidth: 2,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: 'hsl(var(--primary))',
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-[500px] rounded-lg border bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
      >
        <Controls className="bg-card border border-border" />
        <MiniMap 
          className="bg-card border border-border"
          nodeColor={(node) => {
            switch (node.data.status) {
              case "RUNNING": return "hsl(var(--success))";
              case "STOPPED": return "hsl(var(--destructive))";
              case "PARTIAL": return "hsl(var(--warning))";
              default: return "hsl(var(--muted))";
            }
          }}
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          className="opacity-30"
        />
      </ReactFlow>
    </div>
  );
}