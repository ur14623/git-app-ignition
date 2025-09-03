import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Database,
  Grid3X3,
  List,
  Eye
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
  
  // Display limits state
  const [displayLimits, setDisplayLimits] = useState<{[key: string]: number}>({
    flows: 10,
    nodes: 10,
    subnodes: 10,
    parameters: 10
  });
  
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

  // Helper functions
  const handleDisplayLimitChange = (category: string, limit: number) => {
    setDisplayLimits(prev => ({ ...prev, [category]: limit }));
  };

  const getDisplayedItems = (items: any[], category: string) => {
    return items.slice(0, displayLimits[category]);
  };

  // Render controls component
  const renderViewControls = (category: string, itemCount: number) => (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Label htmlFor={`limit-${category}`} className="text-sm">Show:</Label>
        <Select
          value={displayLimits[category].toString()}
          onValueChange={(value) => handleDisplayLimitChange(category, parseInt(value))}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value={itemCount.toString()}>All ({itemCount})</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Eye className="h-4 w-4" />
        Showing {Math.min(displayLimits[category], itemCount)} of {itemCount}
      </div>
    </div>
  );

  // Render items in list format
  const renderFlowsList = (flows: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {flows.map((flow: any) => (
          <TableRow key={flow.id}>
            <TableCell className="font-medium">{flow.name}</TableCell>
            <TableCell>
              <Badge variant={flow.is_deployed ? "default" : "outline"}>
                {flow.is_deployed ? "Deployed" : "Draft"}
              </Badge>
            </TableCell>
            <TableCell>{new Date(flow.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/flows/${flow.id}/edit`)}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportFlow(flow)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleCloneFlow(flow)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteFlow(flow.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderNodesList = (nodes: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map((node: any) => (
          <TableRow key={node.id}>
            <TableCell className="font-medium">{node.name}</TableCell>
            <TableCell>
              <Badge variant={node.is_deployed ? "default" : "outline"}>
                {node.is_deployed ? "Deployed" : "Draft"}
              </Badge>
            </TableCell>
            <TableCell>{node.version || 'N/A'}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/nodes/${node.id}/edit`)}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportNode(node)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteNode(node.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderSubnodesList = (subnodes: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Version</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subnodes.map((subnode: any) => (
          <TableRow key={subnode.id}>
            <TableCell className="font-medium">{subnode.name}</TableCell>
            <TableCell>
              <Badge variant={subnode.active_version ? "default" : "outline"}>
                {subnode.active_version ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>{subnode.active_version || 'N/A'}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/subnodes/${subnode.id}/edit`)}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportSubnode(subnode)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteSubnode(subnode.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderParametersList = (parameters: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Key</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {parameters.map((param: any) => (
          <TableRow key={param.id}>
            <TableCell className="font-medium">{param.key}</TableCell>
            <TableCell className="max-w-xs truncate">{param.value}</TableCell>
            <TableCell>
              <Badge variant={param.is_active ? "default" : "outline"}>
                {param.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/parameters/${param.id}/edit`)}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportParameter(param.id)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteParameter(param.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

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
                <div className="space-y-4">
                  {renderViewControls('flows', flows.length)}
                  
                  <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg">
                    {renderFlowsList(getDisplayedItems(flows, 'flows'))}
                  </div>
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
                <div className="space-y-4">
                  {renderViewControls('nodes', nodes.length)}
                  
                  <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg">
                    {renderNodesList(getDisplayedItems(nodes, 'nodes'))}
                  </div>
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
                <div className="space-y-4">
                  {renderViewControls('subnodes', (subnodesData?.results || []).length)}
                  
                  <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg">
                    {renderSubnodesList(getDisplayedItems((subnodesData?.results || []), 'subnodes'))}
                  </div>
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
                <div className="space-y-4">
                  {renderViewControls('parameters', parameters.length)}
                  
                  <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg">
                    {renderParametersList(getDisplayedItems(parameters, 'parameters'))}
                  </div>
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