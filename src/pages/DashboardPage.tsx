import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  GitFork, 
  Network, 
  Plus, 
  Settings, 
  TrendingUp, 
  Users, 
  Workflow,
  Zap,
  BarChart3,
  PieChart,
  Monitor,
  Server
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useItems } from './apis/ItemService';

const stats = [
  {
    title: "Active Flows",
    value: "12",
    change: "+2.1%",
    trend: "up",
    icon: Workflow,
    color: "text-primary",
    bgColor: "bg-primary/10",
    total: "24 Total"
  },
  {
    title: "Running Processes",
    value: "8",
    change: "+12%",
    trend: "up", 
    icon: Activity,
    color: "text-success",
    bgColor: "bg-success/10",
    total: "16 Total"
  },
  {
    title: "System Health",
    value: "99.2%",
    change: "+0.3%",
    trend: "up",
    icon: Monitor,
    color: "text-info",  
    bgColor: "bg-info/10",
    total: "Uptime"
  },
  {
    title: "Data Processed",
    value: "2.4TB",
    change: "+18%",
    trend: "up",
    icon: Database,
    color: "text-warning",
    bgColor: "bg-warning/10", 
    total: "This Month"
  }
];

const recentActivities = [
  {
    id: 1,
    type: "flow_deployed",
    title: "ETL Pipeline deployed",
    description: "Customer data processing flow is now live",
    timestamp: "2 minutes ago",
    status: "success",
    icon: CheckCircle
  },
  {
    id: 2, 
    type: "node_updated",
    title: "SftpCollector node updated",
    description: "Version 2.1 deployed with performance improvements",
    timestamp: "15 minutes ago", 
    status: "info",
    icon: Network
  },
  {
    id: 3,
    type: "alert",
    title: "High memory usage detected", 
    description: "Node validation-processor using 85% memory",
    timestamp: "1 hour ago",
    status: "warning", 
    icon: AlertTriangle
  },
  {
    id: 4,
    type: "flow_created",
    title: "New flow created",
    description: "Data enrichment pipeline added to system",
    timestamp: "3 hours ago",
    status: "success",
    icon: Plus
  }
];

const quickActions = [
  {
    title: "Create Flow",
    description: "Build a new data processing pipeline",
    icon: Workflow,
    color: "text-primary",
    bgColor: "bg-primary/10",
    route: "/flows",
    action: "create"
  },
  {
    title: "Monitor System",
    description: "View real-time performance metrics",
    icon: BarChart3,
    color: "text-info",
    bgColor: "bg-info/10", 
    route: "/reports/flows"
  },
  {
    title: "Manage Nodes",
    description: "Configure and deploy processing nodes",
    icon: Network,
    color: "text-success",
    bgColor: "bg-success/10",
    route: "/nodes"
  },
  {
    title: "View Alerts",
    description: "Check system notifications and issues",
    icon: AlertTriangle,
    color: "text-warning", 
    bgColor: "bg-warning/10",
    route: "/alerts/flows"
  }
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: flows } = useItems();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-success" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "info": return <Network className="h-4 w-4 text-info" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary-glow/5 rounded-2xl" />
          <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-card">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      Flow Orchestrator Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                      Welcome back! Here's what's happening with your data pipelines.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-sm font-medium text-foreground">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-2xl font-bold text-primary">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour12: false 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card 
              key={stat.title}
              className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 shadow-subtle hover:shadow-card transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {stat.value}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${stat.trend === 'up' ? 'text-success border-success/30' : 'text-destructive border-destructive/30'}`}
                  >
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.total}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* System Status */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  System Status
                </CardTitle>
                <CardDescription>Real-time performance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">CPU Usage</span>
                      <span className="text-muted-foreground">34%</span>
                    </div>
                    <Progress value={34} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Memory Usage</span>
                      <span className="text-muted-foreground">67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Storage Usage</span>
                      <span className="text-muted-foreground">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Network I/O</span>
                      <span className="text-muted-foreground">23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">All Systems Operational</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/reports/flows")}>
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest system events and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="mt-1">
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-sm text-foreground">
                          {activity.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activity.description}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {activity.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="w-full justify-start h-auto p-4 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${(index + 4) * 150}ms` }}
                    onClick={() => navigate(action.route)}
                  >
                    <div className={`p-2 rounded-lg ${action.bgColor} mr-3`}>
                      <action.icon className={`h-4 w-4 ${action.color}`} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* System Overview */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">24</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Flows</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-success">48</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Nodes</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-info">96</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Subnodes</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-warning">124</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Parameters</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/20 hover:bg-primary/5"
                    onClick={() => navigate("/flows")}
                  >
                    View All Flows
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}