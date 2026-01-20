import { useState } from "react";
import {
  Shield,
  Check,
  AlertTriangle,
  Clock,
  FileText,
  Users,
  Lock,
  Eye,
  History,
  ChevronDown,
  ChevronRight,
  Database,
  GitBranch,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Layer 0: Governance & Reproducibility components

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details?: string;
}

interface LineageNode {
  id: string;
  name: string;
  type: "dataset" | "model" | "artifact" | "config";
  hash: string;
  timestamp: string;
  parents?: string[];
}

interface RBACRole {
  id: string;
  name: string;
  permissions: string[];
  users: string[];
}

// Mock data
const auditLog: AuditEntry[] = [
  {
    id: "1",
    timestamp: "2026-01-19 14:32:15",
    user: "dr.kim",
    action: "APPROVED",
    resource: "TaskSpec v1.2",
    details: "Approved research question and endpoint definition",
  },
  {
    id: "2",
    timestamp: "2026-01-19 14:28:03",
    user: "ml.engineer.lee",
    action: "MODIFIED",
    resource: "PreprocessRecipe",
    details: "Updated bandpass filter range to 0.5-45Hz",
  },
  {
    id: "3",
    timestamp: "2026-01-19 14:15:42",
    user: "data.admin",
    action: "UPLOADED",
    resource: "Dataset manifest",
    details: "Added 50 new EDF files from site-B",
  },
  {
    id: "4",
    timestamp: "2026-01-19 13:55:00",
    user: "system",
    action: "VALIDATED",
    resource: "Leakage Validator",
    details: "All 5 leakage rules passed",
  },
  {
    id: "5",
    timestamp: "2026-01-19 13:45:22",
    user: "reviewer.park",
    action: "REVIEWED",
    resource: "CohortSpec",
    details: "Verified inclusion/exclusion criteria",
  },
];

const lineageNodes: LineageNode[] = [
  {
    id: "raw-data",
    name: "Raw EDF Files",
    type: "dataset",
    hash: "sha256:a1b2c3",
    timestamp: "2026-01-18 09:00:00",
  },
  {
    id: "qc-data",
    name: "QC Passed Data",
    type: "dataset",
    hash: "sha256:d4e5f6",
    timestamp: "2026-01-18 11:30:00",
    parents: ["raw-data"],
  },
  {
    id: "preprocess-config",
    name: "PreprocessRecipe",
    type: "config",
    hash: "sha256:g7h8i9",
    timestamp: "2026-01-18 10:00:00",
  },
  {
    id: "processed-data",
    name: "Processed Features",
    type: "dataset",
    hash: "sha256:j0k1l2",
    timestamp: "2026-01-18 14:00:00",
    parents: ["qc-data", "preprocess-config"],
  },
  {
    id: "split-config",
    name: "SplitPlan",
    type: "config",
    hash: "sha256:m3n4o5",
    timestamp: "2026-01-18 12:00:00",
  },
  {
    id: "train-set",
    name: "Training Set",
    type: "dataset",
    hash: "sha256:p6q7r8",
    timestamp: "2026-01-18 15:00:00",
    parents: ["processed-data", "split-config"],
  },
  {
    id: "model-v1",
    name: "Model Checkpoint",
    type: "model",
    hash: "sha256:s9t0u1",
    timestamp: "2026-01-19 10:00:00",
    parents: ["train-set"],
  },
  {
    id: "metrics-bundle",
    name: "MetricsBundle",
    type: "artifact",
    hash: "sha256:v2w3x4",
    timestamp: "2026-01-19 12:00:00",
    parents: ["model-v1"],
  },
];

const rbacRoles: RBACRole[] = [
  {
    id: "admin",
    name: "Admin",
    permissions: ["all"],
    users: ["sys.admin"],
  },
  {
    id: "researcher",
    name: "Researcher",
    permissions: ["read:all", "write:taskspec", "write:cohortspec", "approve:research"],
    users: ["dr.kim", "dr.lee"],
  },
  {
    id: "ml-engineer",
    name: "ML Engineer",
    permissions: ["read:all", "write:preprocess", "write:training", "run:pipeline"],
    users: ["ml.engineer.lee", "ml.engineer.park"],
  },
  {
    id: "reviewer",
    name: "Reviewer",
    permissions: ["read:all", "approve:results", "comment:all"],
    users: ["reviewer.park", "reviewer.choi"],
  },
  {
    id: "data-admin",
    name: "Data Admin",
    permissions: ["read:all", "write:dataset", "manage:lineage"],
    users: ["data.admin"],
  },
];

function AuditLogSection() {
  return (
    <div className="bg-card rounded-lg border">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Audit Trail</h3>
        </div>
        <span className="text-xs text-muted-foreground">Last 5 entries</span>
      </div>
      <div className="divide-y">
        {auditLog.map((entry) => (
          <div key={entry.id} className="p-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-mono px-1.5 py-0.5 rounded",
                    entry.action === "APPROVED" && "bg-status-pass/20 text-status-pass",
                    entry.action === "MODIFIED" && "bg-status-warn/20 text-status-warn",
                    entry.action === "UPLOADED" && "bg-primary/20 text-primary",
                    entry.action === "VALIDATED" && "bg-status-pass/20 text-status-pass",
                    entry.action === "REVIEWED" && "bg-muted text-muted-foreground"
                  )}
                >
                  {entry.action}
                </span>
                <span className="text-sm font-medium">{entry.resource}</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {entry.timestamp}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{entry.user}</span>
              {entry.details && (
                <>
                  <span className="mx-1">·</span>
                  <span>{entry.details}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineageGraph() {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  const getNodeIcon = (type: LineageNode["type"]) => {
    switch (type) {
      case "dataset":
        return Database;
      case "model":
        return GitBranch;
      case "config":
        return FileText;
      case "artifact":
        return FileText;
      default:
        return FileText;
    }
  };

  const getNodeColor = (type: LineageNode["type"]) => {
    switch (type) {
      case "dataset":
        return "text-blue-500 bg-blue-500/10";
      case "model":
        return "text-purple-500 bg-purple-500/10";
      case "config":
        return "text-orange-500 bg-orange-500/10";
      case "artifact":
        return "text-green-500 bg-green-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="bg-card rounded-lg border">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">Lineage Graph</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {lineageNodes.length} nodes
          </span>
          <span className="w-2 h-2 rounded-full bg-status-pass" />
          <span className="text-xs text-status-pass">100% traced</span>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {lineageNodes.map((node) => {
            const Icon = getNodeIcon(node.type);
            const colorClass = getNodeColor(node.type);
            const isExpanded = expandedNode === node.id;

            return (
              <div key={node.id}>
                <button
                  onClick={() => setExpandedNode(isExpanded ? null : node.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {node.parents ? (
                    isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )
                  ) : (
                    <div className="w-4" />
                  )}
                  <div className={cn("p-1.5 rounded", colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{node.name}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Hash className="w-3 h-3" />
                      <span className="font-mono">{node.hash}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {node.timestamp.split(" ")[1]}
                  </span>
                </button>
                {isExpanded && node.parents && (
                  <div className="ml-8 pl-4 border-l-2 border-muted mt-1 mb-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      Derived from:
                    </div>
                    {node.parents.map((parentId) => {
                      const parent = lineageNodes.find((n) => n.id === parentId);
                      if (!parent) return null;
                      const ParentIcon = getNodeIcon(parent.type);
                      const parentColor = getNodeColor(parent.type);
                      return (
                        <div
                          key={parentId}
                          className="flex items-center gap-2 p-1 text-sm"
                        >
                          <div className={cn("p-1 rounded", parentColor)}>
                            <ParentIcon className="w-3 h-3" />
                          </div>
                          <span>{parent.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {parent.hash}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs">
          {[
            { type: "dataset", label: "Dataset" },
            { type: "model", label: "Model" },
            { type: "config", label: "Config" },
            { type: "artifact", label: "Artifact" },
          ].map((item) => {
            const Icon = getNodeIcon(item.type as LineageNode["type"]);
            const colorClass = getNodeColor(item.type as LineageNode["type"]);
            return (
              <div key={item.type} className="flex items-center gap-1">
                <div className={cn("p-1 rounded", colorClass)}>
                  <Icon className="w-3 h-3" />
                </div>
                <span className="text-muted-foreground">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RBACSection() {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  return (
    <div className="bg-card rounded-lg border">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <h3 className="font-semibold">RBAC Configuration</h3>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-status-pass" />
          <span className="text-xs text-status-pass">Active</span>
        </div>
      </div>
      <div className="divide-y">
        {rbacRoles.map((role) => {
          const isExpanded = expandedRole === role.id;
          return (
            <div key={role.id}>
              <button
                onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-medium flex-1 text-left">{role.name}</span>
                <span className="text-xs text-muted-foreground">
                  {role.users.length} users
                </span>
              </button>
              {isExpanded && (
                <div className="px-4 pb-3 ml-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Permissions
                      </div>
                      <div className="space-y-1">
                        {role.permissions.map((perm) => (
                          <div
                            key={perm}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Check className="w-3 h-3 text-status-pass" />
                            <span className="font-mono">{perm}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Users
                      </div>
                      <div className="space-y-1">
                        {role.users.map((user) => (
                          <div
                            key={user}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <span>{user}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DataGovernancePanelProps {
  showAudit?: boolean;
  showLineage?: boolean;
  showRBAC?: boolean;
}

export function DataGovernancePanel({
  showAudit = true,
  showLineage = true,
  showRBAC = true,
}: DataGovernancePanelProps) {
  return (
    <div className="space-y-6">
      {/* Layer 0 Header */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <Shield className="w-6 h-6 text-primary" />
        <div>
          <h2 className="font-semibold">Layer 0: Governance & Reproducibility</h2>
          <p className="text-sm text-muted-foreground">
            RBAC, Lineage tracking, and Audit trail for full reproducibility
          </p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-status-pass" />
            <span className="text-sm">B0: 100% Reproducible</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-status-pass" />
            <span className="text-sm">B1: 100% Lineage</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {showLineage && <LineageGraph />}
        {showRBAC && <RBACSection />}
      </div>

      {showAudit && <AuditLogSection />}
    </div>
  );
}
