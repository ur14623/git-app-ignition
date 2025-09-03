import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  Copy, 
  Settings,
  Workflow,
  Network,
  GitFork,
  Database
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useItems } from '@/pages/apis/ItemService';
import { deleteItem } from '@/pages/apis/ItemService';
import { CreateFlowDialog } from "@/pages/flows/create-flow-dialog";
import { CloneFlowDialog } from "@/pages/flows/clone-flow-dialog";
import { useSubnodes, subnodeService } from "@/services/subnodeService";
import { parameterService } from "@/services/parameterService";
import { LoadingCard } from "@/components/ui/loading";
import axios from "axios";

export function DevToolPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Flows state
  const { data: flowsData, loading: flowsLoading } = useItems();
  const [flows, setFlows] = useState<any[]>([]);
  const [showCreateFlowDialog, setShowCreateFlowDialog] = useState(false);
  const [showCloneFlowDialog, setShowCloneFlowDialog] = useState(false);
  const [flowToClone, setFlowToClone] = useState<any>(null);
  
  // Nodes state
  const [nodes, setNodes] = useState<any[]>([]);
  const [nodesLoading, setNodesLoading] = useState(true);
  
  // Subnodes state  
  const { data: subnodesData, loading: subnodesLoading, refetch: refetchSubnodes } = useSubnodes();
  
  // Parameters state
  const [parameters, setParameters] = useState<any[]>([]);
  const [parametersLoading, setParametersLoading] = useState(true);

  // Fetch nodes
  const fetchNodes = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/node-families/");
      setNodes(response.data.results || []);
    } catch (error) {
      console.error("Error fetching nodes:", error);
    } finally {
      setNodesLoading(false);
    }
  };

  // Fetch parameters
  const fetchParameters = async () => {
    try {
      const response = await parameterService.getParameters();
      setParameters(response);
    } catch (error) {
      console.error("Error fetching parameters:", error);
    } finally {
      setParametersLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchNodes();
    fetchParameters();
  }, []);

  // Sync flows data when it changes
  useEffect(() => {
    if (flowsData) {
      setFlows(flowsData);
    }
  }, [flowsData]);

  // Flow handlers
  const handleDeleteFlow = async (flowId: string) => {
    try {
      await deleteItem(flowId);
      setFlows(flows.filter(flow => flow.id !== flowId));
      toast({
        title: "Success",
        description: "Flow deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete flow",
        variant: "destructive",
      });
    }
  };

  const handleExportFlow = (flow: any) => {
    const dataStr = JSON.stringify(flow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${flow.name}.json`;
    link.click();
  };

  const handleCloneFlow = (flow: any) => {
    setFlowToClone(flow);
    setShowCloneFlowDialog(true);
  };

  // Node handlers
  const handleDeleteNode = async (nodeId: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/node-families/${nodeId}/`);
      setNodes(nodes.filter(node => node.id !== nodeId));
      toast({
        title: "Success",
        description: "Node deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete node",
        variant: "destructive",
      });
    }
  };

  const handleExportNode = (node: any) => {
    const dataStr = JSON.stringify(node, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${node.name}.json`;
    link.click();
  };

  // Subnode handlers
  const handleDeleteSubnode = async (subnodeId: string) => {
    try {
      await subnodeService.deleteSubnode(subnodeId);
      toast({
        title: "Success",
        description: "Subnode deleted successfully",
      });
      refetchSubnodes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subnode",
        variant: "destructive",
      });
    }
  };

  const handleExportSubnode = (subnode: any) => {
    const dataStr = JSON.stringify(subnode, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${subnode.name}.json`;
    link.click();
  };

  // Parameter handlers
  const handleDeleteParameter = async (paramId: string) => {
    try {
      await parameterService.deleteParameter(paramId);
      setParameters(parameters.filter(param => param.id !== paramId));
      toast({
        title: "Success",
        description: "Parameter deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete parameter",
        variant: "destructive",
      });
    }
  };

  const handleExportParameter = async (paramId: string) => {
    try {
      const blob = await parameterService.exportParameter(paramId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `parameter_${paramId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export parameter",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary-glow/5 rounded-2xl" />
          <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-card">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Development Tools
              </h1>
              <p className="text-muted-foreground">
                Create, manage, import, export, clone and delete all system components
              </p>
            </div>
          </div>
        </div>

        {/* Tabs for different categories */}
        <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl shadow-subtle">
          <Tabs defaultValue="flows" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/30">
              <TabsTrigger value="flows" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Flows
              </TabsTrigger>
              <TabsTrigger value="nodes" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Nodes
              </TabsTrigger>
              <TabsTrigger value="subnodes" className="flex items-center gap-2">
                <GitFork className="h-4 w-4" />
                Subnodes
              </TabsTrigger>
              <TabsTrigger value="parameters" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Parameters
              </TabsTrigger>
            </TabsList>

            {/* Flows Tab */}
            <TabsContent value="flows" className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Flows Management</h2>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Flow
                  </Button>
                  <Button onClick={() => setShowCreateFlowDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Flow
                  </Button>
                </div>
              </div>
              
              {flowsLoading ? (
                <LoadingCard text="Loading flows..." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flows.map((flow: any) => (
                    <Card key={flow.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-foreground text-lg font-semibold flex items-center justify-between">
                          {flow.name}
                          <Badge variant={flow.is_deployed ? "default" : "outline"}>
                            {flow.is_deployed ? "Deployed" : "Draft"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/flows/${flow.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportFlow(flow)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCloneFlow(flow)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteFlow(flow.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Nodes Tab */}
            <TabsContent value="nodes" className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Nodes Management</h2>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Node
                  </Button>
                  <Button onClick={() => navigate("/nodes/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Node
                  </Button>
                </div>
              </div>
              
              {nodesLoading ? (
                <LoadingCard text="Loading nodes..." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nodes.map((node: any) => (
                    <Card key={node.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-foreground text-lg font-semibold flex items-center justify-between">
                          {node.name}
                          <Badge variant={node.is_deployed ? "default" : "outline"}>
                            {node.is_deployed ? "Deployed" : "Draft"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/nodes/${node.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportNode(node)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* Clone functionality */}}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteNode(node.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Subnodes Tab */}
            <TabsContent value="subnodes" className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Subnodes Management</h2>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Subnode
                  </Button>
                  <Button onClick={() => navigate("/subnodes/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Subnode
                  </Button>
                </div>
              </div>
              
              {subnodesLoading ? (
                <LoadingCard text="Loading subnodes..." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(subnodesData?.results || []).map((subnode: any) => (
                    <Card key={subnode.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-foreground text-lg font-semibold flex items-center justify-between">
                          {subnode.name}
                          <Badge variant={subnode.active_version ? "default" : "outline"}>
                            {subnode.active_version ? "Active" : "Inactive"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/subnodes/${subnode.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportSubnode(subnode)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* Clone functionality */}}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSubnode(subnode.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Parameters Tab */}
            <TabsContent value="parameters" className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Parameters Management</h2>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Parameter
                  </Button>
                  <Button onClick={() => navigate("/parameters/new")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Parameter
                  </Button>
                </div>
              </div>
              
              {parametersLoading ? (
                <LoadingCard text="Loading parameters..." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {parameters.map((param: any) => (
                    <Card key={param.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-foreground text-lg font-semibold flex items-center justify-between">
                          {param.key}
                          <Badge variant={param.is_active ? "default" : "outline"}>
                            {param.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/parameters/${param.id}/edit`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportParameter(param.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* Clone functionality */}}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteParameter(param.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialogs */}
      <CreateFlowDialog 
        open={showCreateFlowDialog} 
        onOpenChange={setShowCreateFlowDialog}
      />
      
      <CloneFlowDialog
        open={showCloneFlowDialog}
        onOpenChange={setShowCloneFlowDialog}
        sourceFlow={flowToClone}
        onClone={(sourceFlow, newName, newDescription) => {
          const clonedFlow = {
            ...sourceFlow,
            id: Date.now().toString(),
            name: newName,
            description: newDescription,
            is_active: false,
            is_deployed: false,
            created_at: new Date().toISOString(),
            created_by: "Current User"
          };
          setFlows([...flows, clonedFlow]);
          navigate(`/flows/${clonedFlow.id}/edit`);
        }}
      />
    </div>
  );
}