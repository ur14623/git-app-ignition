import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingCard } from "@/components/ui/loading";
import { FlowCanvas } from "./FlowCanvas";
import { 
  ArrowLeft,
  Play, 
  Pause, 
  RotateCcw, 
  Clock,
  Server,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  Filter,
  Search,
  Eye,
  List,
  Network,
  Zap,
  Settings,
  Bell,
  FileText,
  Download,
  Edit,
  Plus,
  Square,
  History,
  MoreVertical,
  Copy,
  Trash2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PerformanceStats } from "@/pages/mediations/components/PerformanceStats";
import { AlertsLogsPanel } from "@/pages/mediations/components/AlertsLogsPanel";
import { useToast } from "@/hooks/use-toast";
import { flowService, FlowVersion } from "@/services/flowService";

export function FlowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [flow, setFlow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");
  const [description, setDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  useEffect(() => {
    const fetchFlowStructure = async () => {
      try {
        const response = await flowService.getFlowGraph(id!);
        setFlow(response);
        setDescription((response as any)?.description || "No description available");
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
    if (!name) return 'generic';
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
        x: (index % 4) * 300 + 100,
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

  // Convert nodes for FlowPipeline component (for list view)
  const nodesData = Array.from(uniqueNodes.values()).map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type || "Generic",
    status: flow.is_running ? "RUNNING" : "STOPPED",
    scheduling: "Real-time",
    processed: Math.floor(Math.random() * 50000),
    errors: Math.floor(Math.random() * 100),
    host: "flow-host-01",
    position: { x: 100, y: 100 },
    subnodeName: node.selected_subnode?.name || "Default_Subnode"
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RUNNING": return "bg-success text-success-foreground";
      case "STOPPED": return "bg-destructive text-destructive-foreground";
      case "PARTIAL": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

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

  const flowStatus = flow.is_running ? "RUNNING" : "STOPPED";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                back
              </Button>
              
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  {flow.name}
                </h1>
                <Badge variant="outline" className="text-xs">
                  v{flow.version}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Flow Execution Controls */}
              {!flow.is_running && (
                <Button 
                  size="icon" 
                  variant="outline" 
                  title="Start Flow"
                  onClick={handleRunFlow}
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
              {flow.is_running && (
                <Button 
                  size="icon" 
                  variant="outline" 
                  title="Stop Flow"
                  onClick={handleStopFlow}
                >
                  <Pause className="h-4 w-4" />
                </Button>
              )}
              <Button 
                size="icon" 
                variant="outline" 
                title="Restart Flow"
                onClick={() => {
                  if (flow.is_running) {
                    handleStopFlow();
                    setTimeout(() => handleRunFlow(), 1000);
                  } else {
                    handleRunFlow();
                  }
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              {/* Separator */}
              <div className="h-6 w-px bg-border" />
              
              {/* Edit/Create New Version Button */}
              {flow.is_deployed ? (
                <Button 
                  variant="outline"
                  size="icon"
                  title="Create New Version"
                  onClick={() => toast({ title: "Create New Version", description: "Creating new version..." })}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  size="icon"
                  title="Edit Version"
                  onClick={() => navigate(`/flows/${id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              
              {/* Deploy/Undeploy Button */}
              <Button 
                variant={flow.is_deployed ? "destructive" : "default"}
                size="icon"
                title={flow.is_deployed ? "Undeploy" : "Deploy"}
                onClick={() => {
                  setFlow(prev => ({ ...prev, is_deployed: !prev.is_deployed }));
                  toast({
                    title: flow.is_deployed ? "Flow Undeployed" : "Flow Deployed",
                    description: flow.is_deployed ? "Flow has been undeployed" : "Flow has been deployed successfully"
                  });
                }}
              >
                {flow.is_deployed ? (
                  <Square className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              {/* Version History Button */}
              <Button 
                variant="outline" 
                size="icon"
                title="Version History"
                onClick={() => toast({ title: "Version History", description: "Opening version history..." })}
              >
                <History className="h-4 w-4" />
              </Button>

              {/* Three Dots Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    title="More Actions"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toast({ title: "Export Version", description: "Exporting version..." })}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Version
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast({ title: "Clone Version", description: "Cloning version..." })}>
                    <Copy className="h-4 w-4 mr-2" />
                    Clone Version
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => toast({ title: "Delete Version", description: "Deleting version..." })}
                    disabled={flow.is_deployed}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Version
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* General Info Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Badge className={getStatusColor(flowStatus)}>
                  {flowStatus}
                </Badge>
              </div>

              {/* Deployment Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Deployment</Label>
                <Badge className={flow.is_deployed ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                  {flow.is_deployed ? "DEPLOYED" : "NOT DEPLOYED"}
                </Badge>
              </div>

              {/* Version */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <GitBranch className="h-4 w-4" />
                  Version
                </Label>
                <div className="text-sm font-medium text-foreground">v{flow.version}</div>
              </div>

              {/* Node Count */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Network className="h-4 w-4" />
                  Nodes
                </Label>
                <div className="text-sm font-medium text-foreground">{flow.nodes?.length || 0} nodes</div>
              </div>

              {/* Created By */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
                <div className="text-sm font-medium text-foreground">{flow.created_by || 'Unknown'}</div>
              </div>

              {/* Updated */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Last Updated
                </Label>
                <div className="text-sm font-medium text-foreground">
                  {flow.updated_at ? new Date(flow.updated_at).toLocaleString() : 'Unknown'}
                </div>
              </div>
            </div>

            {/* Description (Editable) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Description</Label>
              {isEditingDescription ? (
                <div className="space-y-2">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px]"
                    placeholder="Enter flow description..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setFlow(prev => ({ ...prev, description }));
                        setIsEditingDescription(false);
                        toast({
                          title: "Description Updated",
                          description: "Flow description has been updated.",
                        });
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDescription((flow as any)?.description || "No description available");
                        setIsEditingDescription(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="text-sm text-foreground p-3 rounded-md bg-muted/50 cursor-pointer hover:bg-muted border border-dashed border-muted-foreground/30"
                  onClick={() => setIsEditingDescription(true)}
                >
                  {description || "Click to add description..."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Canvas Section - Flow Visualization */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Flow Canvas
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "graph" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("graph")}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Graph View
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  List View
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "graph" ? (
              <div className="h-[400px] border border-border rounded-lg">
                <FlowCanvas nodes={nodes} edges={edges} onNodeSelect={(node) => console.log(node)} />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Node Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Subnode</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flow.nodes?.map((node) => (
                    <TableRow key={node.id}>
                      <TableCell className="font-medium">{node.name}</TableCell>
                      <TableCell>{node.type || "Generic"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(flowStatus)}>
                          {flowStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{node.order}</TableCell>
                      <TableCell>{node.selected_subnode?.name || "Default"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Flow Monitoring Tabs */}
        <Tabs defaultValue="stream-live-log" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="stream-live-log" className="gap-2">
              <FileText className="h-4 w-4" />
              Stream Live Log
            </TabsTrigger>
            <TabsTrigger value="node-live-log" className="gap-2">
              <Activity className="h-4 w-4" />
              Node Live Log
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="alerts-logs" className="gap-2">
              <Bell className="h-4 w-4" />
              Alerts & Logs
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Execution Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stream-live-log" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Stream Live Log</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <div className="text-xs text-muted-foreground p-2 border-l-2 border-info">
                    [2024-01-20 14:25:12] Flow {flow.name} started successfully
                  </div>
                  <div className="text-xs text-muted-foreground p-2 border-l-2 border-success">
                    [2024-01-20 14:25:15] Processing nodes in sequence...
                  </div>
                  <div className="text-xs text-muted-foreground p-2 border-l-2 border-success">
                    [2024-01-20 14:25:16] Node validation completed successfully
                  </div>
                  <div className="text-xs text-muted-foreground p-2 border-l-2 border-info">
                    [2024-01-20 14:25:17] Flow execution in progress...
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="node-live-log" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Node Live Log</CardTitle>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select node" />
                      </SelectTrigger>
                      <SelectContent>
                        {flow.nodes?.map((node) => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <div className="text-xs text-muted-foreground p-2 border-l-2 border-info">
                    [2024-01-20 14:25:12] Node initialization started
                  </div>
                  <div className="text-xs text-muted-foreground p-2 border-l-2 border-success">
                    [2024-01-20 14:25:13] Node parameters loaded successfully
                  </div>
                  <div className="text-xs text-muted-foreground p-2 border-l-2 border-success">
                    [2024-01-20 14:25:15] Processing data through node pipeline
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <PerformanceStats 
              throughputLastHour={320}
              eventsLastHour={8450}
              eventsLast24h={198960}
              eventsLast7d={1443200}
              errorRate={0.01}
              retryCount={8}
            />
          </TabsContent>

          <TabsContent value="alerts-logs" className="space-y-4">
            <AlertsLogsPanel />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Execution Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Default Execution Priority</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diagnostics">Diagnostic Level</Label>
                    <Select defaultValue="application">
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="application">Application</SelectItem>
                        <SelectItem value="library">Library</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-discard">Auto-discard failed events</Label>
                    <Switch id="auto-discard" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="compression">Enable compression</Label>
                    <Switch id="compression" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-restart">Auto-restart on failure</Label>
                    <Switch id="auto-restart" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buffer-threshold">Node Buffer Threshold (%)</Label>
                  <div className="flex items-center gap-4">
                    <Input type="number" id="buffer-threshold" defaultValue="85" className="w-24" />
                    <span className="text-sm text-muted-foreground">Alert when buffer exceeds this threshold</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">Execution Timeout (minutes)</Label>
                  <div className="flex items-center gap-4">
                    <Input type="number" id="timeout" defaultValue="30" className="w-24" />
                    <span className="text-sm text-muted-foreground">Maximum execution time before timeout</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}