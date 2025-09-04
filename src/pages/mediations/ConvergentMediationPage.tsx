import { useState } from "react";
import { Eye, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface MediationFlow {
  id: string;
  name: string;
  status: "running" | "stopped" | "error";
  description: string;
  lastRun: string;
  processedRecords: number;
  errorRate: number;
}

const convergentFlows: MediationFlow[] = [
  {
    id: "3",
    name: "Convergent Stream A", 
    status: "running",
    description: "Main convergent billing mediation stream",
    lastRun: "2024-01-15 14:35:00",
    processedRecords: 23450,
    errorRate: 0.03
  },
  {
    id: "4",
    name: "Convergent Stream B",
    status: "error",
    description: "Secondary convergent processing stream",
    lastRun: "2024-01-15 13:20:00",
    processedRecords: 12340,
    errorRate: 0.15
  }
];

export function ConvergentMediationPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  const filteredFlows = convergentFlows.filter(flow =>
    flow.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFlows.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedFlows = filteredFlows.slice(startIndex, startIndex + pageSize);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-green-100 text-green-800 border-green-200";
      case "stopped": return "bg-gray-100 text-gray-800 border-gray-200"; 
      case "error": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "running": return "🟢 Running";
      case "stopped": return "🔴 Stopped";
      case "error": return "❌ Error";
      default: return "❓ Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="space-y-8 p-6">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary-glow/5 rounded-2xl" />
          <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-card">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Convergent Mediation
                </h1>
                <p className="text-muted-foreground">
                  Monitor and manage convergent billing mediation flows
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-subtle">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[100px] border-border/50 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="🔍 Search flows..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="max-w-sm border-border/50 bg-background/50 focus:bg-background transition-colors"
              />
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex border border-border/50 rounded-lg bg-background/30 backdrop-blur-sm">
                <Button
                  onClick={() => setViewMode("list")}
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-r-none transition-all duration-200 ${
                    viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10"
                  }`}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setViewMode("grid")}
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-l-none transition-all duration-200 ${
                    viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {viewMode === "list" ? (
          <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl shadow-subtle overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 bg-muted/30">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Last Run</TableHead>
                  <TableHead className="font-semibold">Processed Records</TableHead>
                  <TableHead className="font-semibold">Error Rate</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFlows.map((flow) => (
                  <TableRow key={flow.id} className="border-border/30 hover:bg-muted/20 transition-colors">
                    <TableCell className="font-semibold text-foreground">{flow.name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(flow.status)}>
                        {getStatusDisplay(flow.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{flow.lastRun}</TableCell>
                    <TableCell>{flow.processedRecords.toLocaleString()}</TableCell>
                    <TableCell>{(flow.errorRate * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/mediations/convergent/flow/${flow.id}`)}
                          className="border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedFlows.map((flow, index) => (
              <Card 
                key={flow.id} 
                className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 shadow-subtle hover:shadow-card transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-lg font-semibold flex items-center justify-between group-hover:text-primary transition-colors">
                    {flow.name}
                    <Badge className={getStatusColor(flow.status)}>
                      {getStatusDisplay(flow.status)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</div>
                    <p className="text-sm text-foreground line-clamp-2">{flow.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Run</div>
                      <div className="text-foreground font-medium">{flow.lastRun}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Records</div>
                      <div className="text-foreground font-medium">{flow.processedRecords.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/mediations/convergent/flow/${flow.id}`)}
                      className="border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all group-hover:scale-110"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredFlows.length > 0 && (
          <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-subtle">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">
                Showing <span className="text-foreground font-semibold">{startIndex + 1}</span> to <span className="text-foreground font-semibold">{Math.min(startIndex + pageSize, filteredFlows.length)}</span> of <span className="text-foreground font-semibold">{filteredFlows.length}</span> flows
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}