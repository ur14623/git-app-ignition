import { useState, useEffect } from "react";
import { Plus, Upload, Download, Settings, Trash2, Eye, Grid2X2, List, Copy, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useNavigate } from "react-router-dom";
import { useSubnodes, subnodeService } from "@/services/subnodeService";
import { toast } from "sonner";
import { useSection } from "@/contexts/SectionContext";

export function SubnodesPage() {
  const { data: subnodesData, loading, error, refetch } = useSubnodes();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const navigate = useNavigate();
  const { setStatusCounts } = useSection();

  // Update stats when data changes
  useEffect(() => {
    if (subnodesData) {
      setStatusCounts({
        total: subnodesData.total,
        deployed: subnodesData.published,
        drafted: subnodesData.draft
      });
    }
  }, [subnodesData, setStatusCounts]);

  const subnodes = subnodesData?.results || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading subnodes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading subnodes: {error}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const filteredSubnodes = subnodes.filter(subnode =>
    subnode.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subnode.node_family_name && subnode.node_family_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getDeploymentBadge = (activeVersion: number | null) => {
    return activeVersion 
      ? { variant: "default" as const, className: "bg-node-deployed text-white" }
      : { variant: "outline" as const, className: "text-node-undeployed border-node-undeployed" };
  };

  const handleDelete = async (subnodeId: string) => {
    try {
      await subnodeService.deleteSubnode(subnodeId);
      toast.success("Subnode deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete subnode");
      console.error("Delete error:", error);
    }
  };

  const handleExport = (subnode: any) => {
    const dataStr = JSON.stringify(subnode, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${subnode.name}.json`;
    link.click();
  };

  const handleClone = async (subnode: any) => {
    try {
      await subnodeService.cloneSubnode(subnode.id, { name: `${subnode.name}_clone` });
      toast.success("Subnode cloned successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to clone subnode");
      console.error("Clone error:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search subnodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex border border-border rounded-md">
            <Button
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none"
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                try {
                  await subnodeService.importSubnode(file);
                  toast.success("Subnode imported successfully");
                  refetch();
                } catch (error) {
                  toast.error("Failed to import subnode");
                  console.error("Import error:", error);
                }
              }
            };
            input.click();
          }}>
            <Upload className="h-4 w-4" />
          </Button>
          <Button onClick={() => navigate("/subnodes/create")}>
            <Plus className="h-4 w-4 mr-2" />
            NEW
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubnodes.map((subnode) => (
            <Card key={subnode.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-foreground text-sm flex items-center justify-between">
                  {subnode.name}
                  <Badge 
                    variant={getDeploymentBadge(subnode.active_version).variant}
                    className={getDeploymentBadge(subnode.active_version).className}
                  >
                    {subnode.active_version ? "Active" : "Inactive"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="text-muted-foreground">
                    <span className="font-medium">Node Family:</span>
                    <Badge variant="outline" className="ml-2">{subnode.node_family_name || subnode.node_family}</Badge>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">Active Version:</span> 
                    <span className="ml-1">{subnode.active_version || 'None'}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-muted-foreground">
                    <span className="font-medium">Last Updated By:</span> {subnode.updated_by || 'Unknown'}
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">Last Updated At:</span> {formatDate(subnode.updated_at)}
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
                      <DropdownMenuItem onClick={() => navigate(`/subnodes/${subnode.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExport(subnode)}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleClone(subnode)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Clone
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(subnode.id)}
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
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SubNode Name</TableHead>
                <TableHead>Node Family</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated By</TableHead>
                <TableHead>Last Updated At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubnodes.map((subnode) => (
                <TableRow key={subnode.id}>
                  <TableCell className="font-medium">{subnode.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{subnode.node_family_name || subnode.node_family}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{subnode.active_version || 'None'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={getDeploymentBadge(subnode.active_version).variant}
                      className={getDeploymentBadge(subnode.active_version).className}
                    >
                      {subnode.active_version ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{subnode.updated_by || 'Unknown'}</TableCell>
                  <TableCell>{formatDate(subnode.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/subnodes/${subnode.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExport(subnode)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleClone(subnode)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(subnode.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}