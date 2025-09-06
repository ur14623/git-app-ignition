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
import { FlowPipeline } from "@/components/FlowPipeline";
import { 
  ArrowLeft,
  Play, 
  Pause, 
  RotateCcw, 
  EyeOff, 
  StickyNote,
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
  Download
} from "lucide-react";

// Mock data for the stream
const streamData = {
  id: "stream-001",
  name: "EBU_Bulk_SMS_LMS_TO_DWH_Non_Processing_Stream",
  status: "RUNNING",
  uptime: "14d 8h 23m",
  lastStarted: "2024-01-15 09:30:45",
  hosts: ["mediation-host-01", "mediation-host-02"],
  currentRevision: "v2.1.4",
  baseRevision: "v2.1.0",
  description: "Processes bulk SMS records from LMS system and loads into data warehouse for non-processing events."
};

const nodesData = [
  { 
    id: "collector-001", 
    name: "SMS_LMS_Collector", 
    type: "Collector", 
    status: "RUNNING", 
    scheduling: "Every 5 minutes", 
    processed: 45672, 
    errors: 12, 
    host: "mediation-host-01",
    position: { x: 100, y: 200 }
  },
  { 
    id: "processor-001", 
    name: "SMS_Validator", 
    type: "Processor", 
    status: "RUNNING", 
    scheduling: "Real-time", 
    processed: 45660, 
    errors: 0, 
    host: "mediation-host-01",
    position: { x: 300, y: 200 }
  },
  { 
    id: "processor-002", 
    name: "SMS_Enricher", 
    type: "Processor", 
    status: "PARTIAL", 
    scheduling: "Real-time", 
    processed: 45350, 
    errors: 310, 
    host: "mediation-host-02",
    position: { x: 500, y: 200 }
  },
  { 
    id: "distributor-001", 
    name: "DWH_Loader", 
    type: "Distributor", 
    status: "RUNNING", 
    scheduling: "Batch - 15 min", 
    processed: 45040, 
    errors: 0, 
    host: "mediation-host-02",
    position: { x: 700, y: 200 }
  }
];

const alertsData = [
  {
    id: 1,
    type: "ERROR",
    message: "SMS_Enricher: Connection timeout to customer database",
    timestamp: "2024-01-20 14:23:45",
    acknowledged: false
  },
  {
    id: 2,
    type: "WARNING", 
    message: "High memory usage on mediation-host-02 (85%)",
    timestamp: "2024-01-20 14:15:32",
    acknowledged: false
  },
  {
    id: 3,
    type: "INFO",
    message: "Scheduled maintenance completed successfully",
    timestamp: "2024-01-20 13:45:12",
    acknowledged: true
  }
];

const performanceData = [
  { time: "14:00", processed: 3200, errors: 12 },
  { time: "14:15", processed: 3450, errors: 8 },
  { time: "14:30", processed: 3100, errors: 15 },
  { time: "14:45", processed: 3800, errors: 5 },
  { time: "15:00", processed: 3600, errors: 3 }
];

export function StreamDetailPage() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");
  const [description, setDescription] = useState(streamData.description);
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RUNNING": return "bg-success text-success-foreground";
      case "STOPPED": return "bg-destructive text-destructive-foreground";
      case "PARTIAL": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case "RUNNING": return "fill-success stroke-success";
      case "STOPPED": return "fill-destructive stroke-destructive";
      case "PARTIAL": return "fill-warning stroke-warning";
      default: return "fill-muted stroke-muted";
    }
  };

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
                Back to Dashboard
              </Button>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  Dashboard → Streams → {streamData.name}
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  {streamData.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-2">
                <Play className="h-4 w-4" />
                Start
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <Pause className="h-4 w-4" />
                Stop  
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Restart
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <EyeOff className="h-4 w-4" />
                Hide
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <StickyNote className="h-4 w-4" />
                Add Note
              </Button>
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
                <Badge className={getStatusColor(streamData.status)}>
                  {streamData.status}
                </Badge>
              </div>

              {/* Uptime */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Uptime
                </Label>
                <div className="text-sm font-medium text-foreground">{streamData.uptime}</div>
                <div className="text-xs text-muted-foreground">Since: {streamData.lastStarted}</div>
              </div>

              {/* Hosts */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Server className="h-4 w-4" />
                  Hosts
                </Label>
                <div className="space-y-1">
                  {streamData.hosts.map(host => (
                    <div key={host} className="text-sm font-medium text-foreground">{host}</div>
                  ))}
                </div>
              </div>

              {/* Version */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <GitBranch className="h-4 w-4" />
                  Version
                </Label>
                <div className="text-sm font-medium text-foreground">{streamData.currentRevision}</div>
                <div className="text-xs text-muted-foreground">Based on: {streamData.baseRevision}</div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Description</Label>
              {isEditingDescription ? (
                <div className="space-y-2">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setIsEditingDescription(false)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDescription(streamData.description);
                        setIsEditingDescription(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="text-sm text-foreground p-3 rounded-md bg-muted/50 cursor-pointer hover:bg-muted"
                  onClick={() => setIsEditingDescription(true)}
                >
                  {description}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Flow / Nodes View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Flow Pipeline
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
              <FlowPipeline nodesData={nodesData} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Node Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Scheduling</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processed</TableHead>
                    <TableHead>Errors</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nodesData.map((node) => (
                    <TableRow key={node.id}>
                      <TableCell className="font-medium">{node.name}</TableCell>
                      <TableCell>{node.type}</TableCell>
                      <TableCell>{node.scheduling}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(node.status)}>
                          {node.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{node.processed.toLocaleString()}</TableCell>
                      <TableCell>{node.errors}</TableCell>
                      <TableCell>{node.host}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Play className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Pause className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <RotateCcw className="h-3 w-3" />
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

        {/* Alerts & Performance Tabs */}
        <Tabs defaultValue="alerts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              Alerts & Logs
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <Activity className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Execution Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Active Alerts</CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Acknowledge All</Button>
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertsData.map((alert) => (
                    <Alert key={alert.id} className={alert.type === "ERROR" ? "border-destructive" : alert.type === "WARNING" ? "border-warning" : "border-info"}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {alert.type === "ERROR" && <XCircle className="h-5 w-5 text-destructive mt-0.5" />}
                          {alert.type === "WARNING" && <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />}
                          {alert.type === "INFO" && <CheckCircle className="h-5 w-5 text-info mt-0.5" />}
                          <div>
                            <AlertDescription className="font-medium">
                              {alert.message}
                            </AlertDescription>
                            <div className="text-xs text-muted-foreground mt-1">
                              {alert.timestamp}
                            </div>
                          </div>
                        </div>
                        {!alert.acknowledged && (
                          <Button size="sm" variant="outline">
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Throughput Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center space-y-2">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">Performance charts will be displayed here</p>
                    <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                      <div>
                        <div className="font-medium">Current Throughput</div>
                        <div className="text-2xl font-bold text-primary">3.6K/sec</div>
                      </div>
                      <div>
                        <div className="font-medium">Peak Today</div>
                        <div className="text-2xl font-bold text-success">5.2K/sec</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Last Hour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3.6K</div>
                  <p className="text-xs text-muted-foreground">Events processed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Last 24h</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87.2K</div>
                  <p className="text-xs text-muted-foreground">Events processed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0.68%</div>
                  <p className="text-xs text-muted-foreground">Last 24h average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Retry Success</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground">Successful retries</p>
                </CardContent>
              </Card>
            </div>
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
                    <Select>
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
                    <Select>
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
                    <Switch id="auto-discard" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="compression">Enable compression</Label>
                    <Switch id="compression" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buffer-threshold">Node Buffer Threshold (%)</Label>
                  <div className="flex items-center gap-4">
                    <Input type="number" id="buffer-threshold" placeholder="85" className="w-24" />
                    <span className="text-sm text-muted-foreground">Alert when buffer exceeds this threshold</span>
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