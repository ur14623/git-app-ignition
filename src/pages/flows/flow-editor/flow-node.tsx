import React, { useState } from 'react';
import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FlowNodeProps {
  data: {
    label: string;
    nodeType?: string;
    deployed?: boolean;
    subnodes?: any[];
    parameters?: any[];
    description?: string;
    version?: number;
    selectedSubnode?: {
      id: string;
      name: string;
      version?: number;
      parameters?: any[];
    };
  };
  selected: boolean;
}

export const FlowNode = memo(({ data, selected }: FlowNodeProps) => {
  // Get the selected subnode from data
  const selectedSubnode = data.selectedSubnode;

  return (
    <div 
      className={`
        bg-node-background border-2 rounded-lg p-4 min-w-[200px] shadow-node
        ${selected ? 'border-primary' : 'border-node-border'}
        ${data.deployed ? 'shadow-[0_0_0_2px_hsl(var(--node-deployed))]' : ''}
        transition-all duration-200
      `}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!bg-edge-default !border-edge-default !w-3 !h-3" 
      />
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm truncate">{data.label}</h3>
          <Badge 
            variant={data.deployed ? "default" : "outline"}
            className={`text-xs ${data.deployed ? 'bg-node-deployed text-white' : 'text-node-undeployed border-node-undeployed'}`}
          >
            {data.deployed ? "Active" : "Inactive"}
          </Badge>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {data.nodeType && <div>Type: {data.nodeType.replace('_', ' ')}</div>}
          {data.version && <div>Version: {data.version}</div>}
        </div>
        
        {data.description && (
          <div className="text-xs text-muted-foreground">{data.description}</div>
        )}

        {/* Display selected subnode or message if none selected */}
        <div className="mt-2">
          {selectedSubnode ? (
            <div className="text-xs p-2 bg-background/50 rounded border text-muted-foreground">
              <div className="flex items-center justify-between">
                <div className="font-medium truncate">{selectedSubnode.name}</div>
                <Badge variant="default" className="text-[10px] px-1">
                  Selected
                </Badge>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                Version {selectedSubnode.version || 1}
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground/60 p-2 bg-background/30 rounded border border-dashed">
              Subnode not selected
            </div>
          )}
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!bg-edge-default !border-edge-default !w-3 !h-3" 
      />
    </div>
  );
});

FlowNode.displayName = 'FlowNode';