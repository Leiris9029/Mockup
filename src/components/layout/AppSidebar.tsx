import { useLocation, Link } from "react-router-dom";
import {
  FileInput,
  Play,
  BarChart3,
  FileOutput,
  Check,
  AlertTriangle,
  X,
  Lock,
  Shield,
  Lightbulb,
  Factory,
  FileSearch,
  Database,
  Users,
  Split,
  Cpu,
  Activity,
  Brain,
  BookOpen,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type NavStatus = "pass" | "warn" | "fail" | "locked" | "active";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  status: NavStatus;
  layer?: string;
}

interface NavGroup {
  layer: string;
  layerName: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    layer: "L1",
    layerName: "Research Orchestrator",
    icon: Lightbulb,
    items: [
      { label: "TaskSpec", path: "/", icon: FileInput, status: "pass" },
    ],
  },
  {
    layer: "L2",
    layerName: "ML Factory",
    icon: Factory,
    items: [
      { label: "Data & QC", path: "/pipeline", icon: Database, status: "pass" },
      { label: "Cohort/Label", path: "/pipeline#cohort", icon: Users, status: "pass" },
      { label: "SplitPlan", path: "/pipeline#split", icon: Split, status: "pass" },
      { label: "Training", path: "/pipeline#training", icon: Cpu, status: "warn" },
    ],
  },
  {
    layer: "L3",
    layerName: "Evidence & Explanation",
    icon: FileSearch,
    items: [
      { label: "MetricsBundle", path: "/results", icon: BarChart3, status: "locked" },
      { label: "ExplainBundle", path: "/results#xai", icon: Brain, status: "locked" },
      { label: "ReportBundle", path: "/export", icon: FileOutput, status: "locked" },
    ],
  },
];

// Legacy nav items for simpler navigation
const navItems: NavItem[] = [
  { label: "TaskSpec", path: "/", icon: FileInput, status: "pass", layer: "L1" },
  { label: "ML Factory", path: "/pipeline", icon: Play, status: "warn", layer: "L2" },
  { label: "Results", path: "/results", icon: BarChart3, status: "locked", layer: "L3" },
  { label: "Export", path: "/export", icon: FileOutput, status: "locked", layer: "L3" },
];

function StatusIndicator({ status }: { status: NavStatus }) {
  const iconClass = "w-3.5 h-3.5";
  
  switch (status) {
    case "pass":
      return (
        <div className="w-5 h-5 rounded-full bg-status-pass flex items-center justify-center">
          <Check className={cn(iconClass, "text-status-pass-foreground")} />
        </div>
      );
    case "warn":
      return (
        <div className="w-5 h-5 rounded-full bg-status-warn flex items-center justify-center">
          <AlertTriangle className={cn(iconClass, "text-status-warn-foreground")} />
        </div>
      );
    case "fail":
      return (
        <div className="w-5 h-5 rounded-full bg-status-fail flex items-center justify-center">
          <X className={cn(iconClass, "text-status-fail-foreground")} />
        </div>
      );
    case "locked":
      return (
        <div className="w-5 h-5 rounded-full bg-status-locked flex items-center justify-center">
          <Lock className={cn(iconClass, "text-status-locked-foreground")} />
        </div>
      );
    default:
      return null;
  }
}

export function AppSidebar() {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["L1", "L2", "L3"]);

  const toggleGroup = (layer: string) => {
    setExpandedGroups((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  return (
    <nav className="w-56 bg-sidebar shrink-0 flex flex-col">
      {/* Layer 0 Banner */}
      <div className="px-4 py-3 bg-sidebar-accent/30 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium">Layer 0: Governance</span>
        </div>
        <div className="flex items-center gap-1 mt-1 text-[10px] text-sidebar-foreground/60">
          <Check className="w-3 h-3 text-status-pass" />
          <span>RBAC · Lineage · Audit</span>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {navGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.layer);
            const GroupIcon = group.icon;

            return (
              <div key={group.layer}>
                <button
                  onClick={() => toggleGroup(group.layer)}
                  className="w-full flex items-center gap-2 text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider mb-2 hover:text-sidebar-foreground transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  <GroupIcon className="w-3.5 h-3.5" />
                  <span>{group.layer}: {group.layerName}</span>
                </button>

                {isExpanded && (
                  <ul className="space-y-1 ml-2">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.path ||
                        (item.path.includes("#") && location.pathname === item.path.split("#")[0]);
                      const Icon = item.icon;

                      return (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="flex-1">{item.label}</span>
                            <StatusIndicator status={isActive ? "active" : item.status} />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Run Manifest Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-[10px] font-medium text-sidebar-foreground/60 uppercase tracking-wider mb-2">
          Run Manifest
        </div>
        <div className="text-xs text-sidebar-foreground/60 space-y-1.5">
          <div className="flex justify-between">
            <span>Run ID</span>
            <span className="font-mono">run-7f3a2b</span>
          </div>
          <div className="flex justify-between">
            <span>Duration</span>
            <span className="font-mono">2h 14m</span>
          </div>
          <div className="flex justify-between">
            <span>Cost</span>
            <span className="font-mono text-status-pass">$2.34</span>
          </div>
          <div className="flex justify-between">
            <span>Seed</span>
            <span className="font-mono">42</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
