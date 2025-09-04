import { 
  Workflow, 
  Network, 
  GitFork, 
  Settings, 
  GitCommitHorizontal,
  Home,
  AlertTriangle,
  FileText,
  Bell,
  BarChart3,
  Wrench,
  Server,
  ChevronRight
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useSection } from "@/contexts/SectionContext";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

const configurationItems = [
  { title: "Flows", url: "/flows", icon: Workflow },
  { title: "Nodes", url: "/nodes", icon: Network },
  { title: "Subnodes", url: "/subnodes", icon: GitFork },
  { title: "Parameters", url: "/parameters", icon: Settings },
];

const alertItems = [
  { title: "Flow Alert", url: "/alerts/flows", icon: AlertTriangle },
  { title: "Node Alert", url: "/alerts/nodes", icon: Bell },
];

const reportItems = [
  { title: "Flow Report", url: "/reports/flows", icon: FileText },
  { title: "Node Report", url: "/reports/nodes", icon: BarChart3 },
];

const devToolItems = [
  { title: "DevTool", url: "/devtool", icon: Wrench },
];

const mediationInstances = [
  { 
    title: "Charging Gateway Mediation", 
    icon: Server, 
    flows: [
      { id: "1", name: "Charging Stream A", url: "/mediations/charging/flow/1" },
      { id: "2", name: "Charging Stream B", url: "/mediations/charging/flow/2" }
    ]
  },
  { 
    title: "Convergent Mediation", 
    icon: Server, 
    flows: [
      { id: "3", name: "Convergent Stream A", url: "/mediations/convergent/flow/3" },
      { id: "4", name: "Convergent Stream B", url: "/mediations/convergent/flow/4" }
    ]
  },
  { 
    title: "NCC Mediation", 
    icon: Server, 
    flows: [
      { id: "5", name: "NCC Stream A", url: "/mediations/ncc/flow/5" },
      { id: "6", name: "NCC Stream B", url: "/mediations/ncc/flow/6" }
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";
  const { setCurrentSection } = useSection();
  const [expandedMediations, setExpandedMediations] = useState<string[]>([]);

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) =>
    isActive(path) 
      ? "bg-sidebar-accent text-sidebar-primary font-medium border-l-4 border-sidebar-primary" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  const handleSectionClick = (title: string) => {
    setCurrentSection(title);
  };

  const toggleMediationExpansion = (mediationTitle: string) => {
    setExpandedMediations(prev => 
      prev.includes(mediationTitle) 
        ? prev.filter(title => title !== mediationTitle)
        : [...prev, mediationTitle]
    );
  };

  const isMediationExpanded = (mediationTitle: string) => {
    return expandedMediations.includes(mediationTitle);
  };

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        {!collapsed && (
          <h1 className="text-lg font-bold text-green-600">
            Safaricom ET pipeline
          </h1>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <Workflow className="h-6 w-6 text-sidebar-primary" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Mediations Group */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Mediations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mediationInstances.map((mediation) => (
                <SidebarMenuItem key={mediation.title}>
                  <SidebarMenuButton
                    onClick={() => toggleMediationExpansion(mediation.title)}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center">
                      <mediation.icon className="h-4 w-4" />
                      {!collapsed && <span className="ml-2">{mediation.title}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronRight 
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isMediationExpanded(mediation.title) ? "rotate-90" : ""
                        }`}
                      />
                    )}
                  </SidebarMenuButton>
                  
                  {!collapsed && isMediationExpanded(mediation.title) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {mediation.flows.map((flow) => (
                        <SidebarMenuButton key={flow.id} asChild size="sm">
                          <NavLink 
                            to={flow.url} 
                            className={getNavClasses(flow.url)}
                            onClick={() => handleSectionClick(flow.name)}
                          >
                            <Workflow className="h-3 w-3" />
                            <span className="ml-2 text-sm">{flow.name}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      ))}
                    </div>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Configuration Group */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Configuration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configurationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={getNavClasses(item.url)}
                      onClick={() => handleSectionClick(item.title)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Alert Group */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Alert
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {alertItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(item.url)}
                      onClick={() => handleSectionClick(item.title)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Report Group */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Report
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(item.url)}
                      onClick={() => handleSectionClick(item.title)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Development Tools Group */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Development
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {devToolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses(item.url)}
                      onClick={() => handleSectionClick(item.title)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}