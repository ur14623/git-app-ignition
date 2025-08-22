// src/FlowsPage.tsx
import { useEffect, useState } from "react";
import { Plus, Upload, Download, Trash2, Eye, Grid, List, Copy, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingCard } from "@/components/ui/loading";
import { useItems } from '../apis/ItemService'; // Using real API data
import { deleteItem } from '../apis/ItemService'; // Using real delete function

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreateFlowDialog } from "./create-flow-dialog";
import { CloneFlowDialog } from "./clone-flow-dialog";
import { useNavigate } from "react-router-dom";

export function FlowsPage() {
  const { data: items, loading, error } = useItems();
  const [flows, setFlows] = useState(items || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [flowToClone, setFlowToClone] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const navigate = useNavigate();

  useEffect(() => {
    if (items) {
      setFlows(items);
    }
  }, [items]);

  const filteredFlows = flows.filter(flow =>
    flow.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFlowStatus = (flow: any) => {
    if (flow.is_running) return "running";
    if (flow.is_deployed) return "deployed";
    return "draft";
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" => {
    switch (status) {
      case "running": return "default";
      case "deployed": return "secondary";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "running": return "🟢 Running";
      case "deployed": return "🟡 Deployed";
      case "draft": return "📝 Draft";
      default: return "❓ Unknown";
    }
  };

const handleDelete = async (flowId: string) => {
    try {
        await deleteItem(flowId); // Call the delete function
        setFlows(flows.filter(flow => flow.id !== flowId)); // Update the state
    } catch (error) {
        console.error('Failed to delete flow:', error);
    }
};




  const handleExport = (flow: any) => {
    const dataStr = JSON.stringify(flow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${flow.name}.json`;
    link.click();
  };

  const handleClone = (flow: any) => {
    setFlowToClone(flow);
    setShowCloneDialog(true);
  };

  const handleCloneConfirm = (sourceFlow: any, newName: string, newDescription: string) => {
    const clonedFlowId = Date.now().toString();
    const clonedFlow = {
      ...sourceFlow,
      id: clonedFlowId,
      name: newName,
      description: newDescription,
      is_active: false,
      is_deployed: false,
      created_at: new Date().toISOString(),
      created_by: "Current User"
    };
    setFlows([...flows, clonedFlow]);
    navigate(`/flows/${clonedFlowId}/edit`);
  };

  if (loading) {
    return <LoadingCard text="Loading flows..." />;
  }

  if (error) {
    return <div>Error loading flows: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search flows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex border border-border rounded-md">
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setViewMode("grid")}
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Flow
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Flow
          </Button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFlows.map((flow) => (
                <TableRow key={flow.id}>
                  <TableCell className="font-medium">{flow.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(getFlowStatus(flow))}>
                      {getStatusDisplay(getFlowStatus(flow))}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">Version {flow.version}</span>
                  </TableCell>
                  <TableCell>{new Date(flow.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{flow.created_by}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/flows/${flow.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExport(flow)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleClone(flow)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Flow</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{flow.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(flow.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlows.map((flow) => (
            <Card key={flow.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-sm flex items-center justify-between">
                  {flow.name}
                  <Badge variant={getStatusBadgeVariant(getFlowStatus(flow))}>
                    {getStatusDisplay(getFlowStatus(flow))}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-muted-foreground">
                    <span className="font-medium">Created:</span> {new Date(flow.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">By:</span> {flow.created_by}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Version:</span> {flow.version}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Description:</span> {flow.description || "No description"}
                  </div>
                </div>
                
                <div className="pt-2 border-t border-border flex justify-between items-center">
                  <div className="text-xs font-medium text-foreground">Actions:</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background border border-border shadow-lg z-50">
                      <DropdownMenuItem onClick={() => navigate(`/flows/${flow.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport(flow)}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleClone(flow)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(flow.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateFlowDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />

      <CloneFlowDialog
        open={showCloneDialog}
        onOpenChange={setShowCloneDialog}
        sourceFlow={flowToClone}
        onClone={handleCloneConfirm}
      />
    </div>
  );
}