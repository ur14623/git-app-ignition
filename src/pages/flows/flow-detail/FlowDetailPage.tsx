import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoadingCard } from "@/components/ui/loading";
import { FlowCanvas } from "./FlowCanvas";
import { FlowHeader } from "./components/FlowHeader";
import { VersionHistoryModal } from "./components/VersionHistoryModal";
import { FlowDetailsPanel } from "./components/FlowDetailsPanel";
import { useToast } from "@/hooks/use-toast";
import { flowService, FlowVersion } from "@/services/flowService";

export function FlowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [flow, setFlow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<FlowVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<FlowVersion | null>(null);

  useEffect(() => {
    const fetchFlowStructure = async () => {
      try {
        const response = await flowService.getFlowGraph(id!);
        setFlow(response);
      } catch (err) {
        setError("Error fetching flow structure");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFlowStructure();
    }
  }, [id]);

  // Fetch versions when requested
  const fetchVersions = async () => {
    if (!id || versions.length > 0) return; // Don't refetch if already loaded
    
    setVersionsLoading(true);
    try {
      const flowVersions = await flowService.getFlowVersions(id);
      setVersions(flowVersions);
    } catch (err) {
      console.error('Error fetching flow versions:', err);
      toast({
        title: "Error",
        description: "Failed to load flow versions",
        variant: "destructive"
      });
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleVersionsToggle = () => {
    setVersionsOpen(!versionsOpen);
    if (!versionsOpen && versions.length === 0) {
      fetchVersions();
    }
  };

  const activateVersion = async (version: number) => {
    if (!id) return;
    
    try {
      await flowService.activateFlowVersion(id, version);
      
      // Update versions list to reflect the change
      setVersions(prevVersions => 
        prevVersions.map(v => ({
          ...v,
          is_active: v.version === version
        }))
      );
      
      // Refresh flow data
      const response = await flowService.getFlowGraph(id);
      setFlow(response);
      
      toast({
        title: "Version Activated",
        description: `Flow version ${version} is now active`,
      });
    } catch (err) {
      console.error('Error activating version:', err);
      toast({
        title: "Error",
        description: "Failed to activate version",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <LoadingCard text="Loading flow details..." />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!flow) {
    return <div>No flow found.</div>;
  }

  // Helper function to determine node type based on name or other criteria
  const getNodeType = (nodeName?: string): string => {
    const name = (nodeName ?? '').toLowerCase();
    if (!name) return 'generic'; // default fallback when name is missing
    if (name.includes('sftp') || name.includes('collector')) return 'sftp_collector';
    if (name.includes('fdc')) return 'fdc';
    if (name.includes('asn1') || name.includes('decoder')) return 'asn1_decoder';
    if (name.includes('ascii')) return 'ascii_decoder';
    if (name.includes('validation')) return 'validation_bln';
    if (name.includes('enrichment')) return 'enrichment_bln';
    if (name.includes('encoder')) return 'encoder';
    if (name.includes('diameter')) return 'diameter_interface';
    if (name.includes('backup')) return 'raw_backup';
    return 'generic';
  };

  // Create unique nodes map to avoid duplicates
  const uniqueNodes = new Map();
  flow.nodes?.forEach((node) => {
    if (!uniqueNodes.has(node.id)) {
      uniqueNodes.set(node.id, node);
    }
  });

  // Prepare nodes from the unique nodes with proper positioning  
  const nodes = Array.from(uniqueNodes.values()).map((node, index) => {
    const nodeType = getNodeType(node.name);
    
    return {
      id: node.id,
      type: nodeType,
      position: { 
        x: (index % 4) * 300 + 100, // Arrange in a grid pattern
        y: Math.floor(index / 4) * 200 + 100 
      },
      data: {
        label: node.name,
        description: `Order: ${node.order}`,
        node: node,
        selected_subnode: node.selected_subnode_id ? { id: node.selected_subnode_id } : undefined,
        parameters: [],
        subnodes: [],
      },
    };
  });

  // Prepare edges from flow edges
  const edges = flow.edges?.map((edge) => ({
    id: edge.id,
    source: edge.from_node,
    target: edge.to_node,
    animated: true,
    label: edge.condition || undefined,
  })) || [];

  const handleRunFlow = async () => {
    try {
      await flowService.runFlow(id!);
      setFlow(prev => ({ ...prev, is_running: true }));
      toast({
        title: "Flow Started",
        description: "The flow has been started successfully.",
      });
    } catch (err: any) {
      console.error("Error starting flow:", err);
      const errorMessage = err.response?.data?.error || err.message || "Error starting flow";
      toast({
        title: "Error Starting Flow",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleStopFlow = async () => {
    try {
      await flowService.stopFlow(id!);
      setFlow(prev => ({ ...prev, is_running: false }));
      toast({
        title: "Flow Stopped",
        description: "The flow has been stopped successfully.",
      });
    } catch (err: any) {
      console.error("Error stopping flow:", err);
      const errorMessage = err.response?.data?.error || err.message || "Error stopping flow";
      toast({
        title: "Error Stopping Flow",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleCreateNewVersion = () => {
    toast({
      title: "Creating New Version",
      description: "This will create a new draft version that can be edited.",
    });
    navigate(`/flows/${id}/clone`);
  };

  const handleEditVersion = () => {
    navigate(`/flows/${id}/edit`);
  };

  const handleToggleDeployment = async () => {
    try {
      if (flow.is_deployed) {
        await flowService.undeployFlow(id!);
        setFlow(prev => ({ ...prev, is_deployed: false, is_running: false }));
        toast({
          title: "Flow Undeployed",
          description: "The flow has been undeployed successfully.",
        });
      } else {
        await flowService.deployFlow(id!);
        setFlow(prev => ({ ...prev, is_deployed: true }));
        toast({
          title: "Flow Deployed",
          description: "The flow has been deployed successfully.",
        });
      }
    } catch (err: any) {
      console.error("Error toggling deployment:", err);
      const errorMessage = err.response?.data?.error || err.message || "Error toggling deployment";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleShowVersionHistory = () => {
    setVersionsOpen(true);
    if (versions.length === 0) {
      fetchVersions();
    }
  };

  const handleSelectVersion = (version: FlowVersion) => {
    setSelectedVersion(version);
  };

  const handleActivateVersion = (version: FlowVersion) => {
    activateVersion(version.version);
  };

  const handleExportVersion = (version: FlowVersion) => {
    toast({
      title: "Export Version",
      description: `Exporting version ${version.version}...`,
    });
    // TODO: Implement export functionality
  };

  const handleCloneVersion = (version: FlowVersion) => {
    toast({
      title: "Clone Version",
      description: `Cloning version ${version.version}...`,
    });
    // TODO: Implement clone functionality
  };

  const handleDeleteVersion = (version: FlowVersion) => {
    toast({
      title: "Delete Version",
      description: `Deleting version ${version.version}...`,
    });
    // TODO: Implement delete functionality
  };

  return (
    <div className="space-y-6">
      {/* Enterprise Flow Header */}
      <FlowHeader
        flow={{
          id: flow.id,
          name: flow.name,
          version: flow.version,
          is_deployed: flow.is_deployed,
          is_running: flow.is_running
        }}
        onCreateNewVersion={handleCreateNewVersion}
        onEditVersion={handleEditVersion}
        onToggleDeployment={handleToggleDeployment}
        onShowVersionHistory={handleShowVersionHistory}
        onExportVersion={() => handleExportVersion(selectedVersion!)}
        onCloneVersion={() => handleCloneVersion(selectedVersion!)}
        onDeleteVersion={() => handleDeleteVersion(selectedVersion!)}
        isLoading={loading || versionsLoading}
      />

      {/* Flow Details Panel */}
      <FlowDetailsPanel 
        flow={{
          id: flow.id,
          name: flow.name,
          description: flow.description,
          nodes: flow.nodes,
          updated_at: flow.updated_at || flow.created_at,
          updated_by: flow.updated_by,
          created_by: flow.created_by
        }}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        open={versionsOpen}
        onOpenChange={setVersionsOpen}
        versions={versions}
        selectedVersion={selectedVersion}
        onSelectVersion={handleSelectVersion}
        onActivateVersion={handleActivateVersion}
        onExportVersion={handleExportVersion}
        onCloneVersion={handleCloneVersion}
        onDeleteVersion={handleDeleteVersion}
        isLoading={versionsLoading}
      />

      {/* Flow Canvas */}
      <div className="h-[600px] border border-border rounded-lg">
        <FlowCanvas nodes={nodes} edges={edges} onNodeSelect={(node) => console.log(node)} />
      </div>
    </div>
  );
}