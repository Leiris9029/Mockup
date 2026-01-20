import { useMemo } from "react";
import {
  Check,
  X,
  AlertTriangle,
  Target,
  Activity,
  Users,
  Brain,
  FileText,
  Clock,
  DollarSign,
  Zap,
  Shield,
  TrendingUp,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MetricStatus = "pass" | "warn" | "fail" | "pending";

interface Metric {
  id: string;
  name: string;
  description: string;
  target: string;
  current: string | number;
  status: MetricStatus;
  icon: React.ComponentType<{ className?: string }>;
  category: "medical" | "engineering";
  layer?: string;
}

// PRD Success Metrics A0-A7 (Medical) and B0-B10 (Engineering)
const successMetrics: Metric[] = [
  // A-Metrics (Medical KPIs)
  {
    id: "A0",
    name: "Primary Metric Hit",
    description: "CI lower bound >= clinically meaningful threshold",
    target: "CI lower ≥ threshold",
    current: "0.72 [0.68-0.76]",
    status: "pass",
    icon: Target,
    category: "medical",
    layer: "L3",
  },
  {
    id: "A1",
    name: "External Validation",
    description: "Held-out hospital or public dataset performance",
    target: "Δ AUC < 5%",
    current: "Δ 3.2%",
    status: "pass",
    icon: Shield,
    category: "medical",
    layer: "L3",
  },
  {
    id: "A2",
    name: "Calibration",
    description: "Expected Calibration Error within threshold",
    target: "ECE < 0.05",
    current: "0.032",
    status: "pass",
    icon: BarChart3,
    category: "medical",
    layer: "L3",
  },
  {
    id: "A3",
    name: "Sensitivity @ Spec",
    description: "Sensitivity at clinical specificity threshold",
    target: "Sens ≥ 0.80 @ Spec 0.90",
    current: "0.83 @ 0.90",
    status: "pass",
    icon: Activity,
    category: "medical",
    layer: "L3",
  },
  {
    id: "A4",
    name: "Subgroup Robustness",
    description: "Performance gap across demographic subgroups",
    target: "Gap < 10%",
    current: "8.2%",
    status: "warn",
    icon: Users,
    category: "medical",
    layer: "L3",
  },
  {
    id: "A5",
    name: "Mechanistic Interpretability",
    description: "Circuit-level explanation coherence score",
    target: "Score ≥ 7/10",
    current: "8/10",
    status: "pass",
    icon: Brain,
    category: "medical",
    layer: "L3",
  },
  {
    id: "A6",
    name: "Overclaiming Detection",
    description: "No unsupported statistical claims",
    target: "0 flags",
    current: "0 flags",
    status: "pass",
    icon: AlertTriangle,
    category: "medical",
    layer: "L3",
  },
  {
    id: "A7",
    name: "Report Completeness",
    description: "All required sections present in report",
    target: "100%",
    current: "95%",
    status: "warn",
    icon: FileText,
    category: "medical",
    layer: "L3",
  },
  // B-Metrics (Engineering KPIs)
  {
    id: "B0",
    name: "Reproducibility",
    description: "Same seed produces identical results",
    target: "100%",
    current: "100%",
    status: "pass",
    icon: Shield,
    category: "engineering",
    layer: "L0",
  },
  {
    id: "B1",
    name: "Lineage Coverage",
    description: "All artifacts have complete lineage",
    target: "100%",
    current: "100%",
    status: "pass",
    icon: TrendingUp,
    category: "engineering",
    layer: "L0",
  },
  {
    id: "B2",
    name: "Schema Validation",
    description: "All outputs conform to JSON schema",
    target: "100%",
    current: "100%",
    status: "pass",
    icon: Check,
    category: "engineering",
    layer: "L0",
  },
  {
    id: "B3",
    name: "Pipeline Latency",
    description: "End-to-end processing time per subject",
    target: "< 30 min",
    current: "22 min",
    status: "pass",
    icon: Clock,
    category: "engineering",
    layer: "L2",
  },
  {
    id: "B4",
    name: "GPU Utilization",
    description: "Average GPU utilization during training",
    target: "> 70%",
    current: "78%",
    status: "pass",
    icon: Zap,
    category: "engineering",
    layer: "L2",
  },
  {
    id: "B5",
    name: "Compute Cost",
    description: "Total compute cost per experiment",
    target: "< $50",
    current: "$42.30",
    status: "pass",
    icon: DollarSign,
    category: "engineering",
    layer: "L2",
  },
  {
    id: "B6",
    name: "Checkpoint Recovery",
    description: "Resume from failure within threshold",
    target: "< 5 min",
    current: "2.3 min",
    status: "pass",
    icon: Shield,
    category: "engineering",
    layer: "L2",
  },
  {
    id: "B7",
    name: "Test Coverage",
    description: "Unit test coverage for core modules",
    target: "> 80%",
    current: "87%",
    status: "pass",
    icon: Check,
    category: "engineering",
    layer: "L2",
  },
  {
    id: "B8",
    name: "Data QC Pass Rate",
    description: "Percentage of data passing QC gates",
    target: "> 90%",
    current: "94%",
    status: "pass",
    icon: BarChart3,
    category: "engineering",
    layer: "L2",
  },
  {
    id: "B9",
    name: "Leakage Detection",
    description: "All 5 leakage rules pass",
    target: "5/5 pass",
    current: "5/5",
    status: "pass",
    icon: Shield,
    category: "engineering",
    layer: "L0",
  },
  {
    id: "B10",
    name: "API Response Time",
    description: "Inference API latency p95",
    target: "< 500ms",
    current: "342ms",
    status: "pass",
    icon: Zap,
    category: "engineering",
    layer: "L2",
  },
];

// Critical Fails from PRD
interface CriticalFail {
  id: string;
  name: string;
  description: string;
  status: "pass" | "fail";
  category: "medical" | "engineering";
}

const criticalFails: CriticalFail[] = [
  // Medical Critical Fails
  {
    id: "CF-M1",
    name: "Data Leakage",
    description: "Training data leaked into test set",
    status: "pass",
    category: "medical",
  },
  {
    id: "CF-M2",
    name: "Label Contamination",
    description: "Target variable derived from future data",
    status: "pass",
    category: "medical",
  },
  {
    id: "CF-M3",
    name: "Population Mismatch",
    description: "Training population differs from deployment",
    status: "pass",
    category: "medical",
  },
  {
    id: "CF-M4",
    name: "Statistical Overclaiming",
    description: "Claims exceed statistical evidence",
    status: "pass",
    category: "medical",
  },
  // Engineering Critical Fails
  {
    id: "CF-E1",
    name: "Non-Reproducible",
    description: "Results differ across runs with same seed",
    status: "pass",
    category: "engineering",
  },
  {
    id: "CF-E2",
    name: "Missing Lineage",
    description: "Artifact provenance cannot be traced",
    status: "pass",
    category: "engineering",
  },
  {
    id: "CF-E3",
    name: "Schema Violation",
    description: "Output does not conform to schema",
    status: "pass",
    category: "engineering",
  },
  {
    id: "CF-E4",
    name: "Silent Failure",
    description: "Error occurred without logging",
    status: "pass",
    category: "engineering",
  },
];

function StatusIcon({ status }: { status: MetricStatus }) {
  const iconClass = "w-4 h-4";

  switch (status) {
    case "pass":
      return <Check className={cn(iconClass, "text-status-pass")} />;
    case "warn":
      return <AlertTriangle className={cn(iconClass, "text-status-warn")} />;
    case "fail":
      return <X className={cn(iconClass, "text-status-fail")} />;
    default:
      return <Clock className={cn(iconClass, "text-muted-foreground")} />;
  }
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <div
      className={cn(
        "bg-card rounded-lg border p-4 hover:border-primary/50 transition-colors",
        metric.status === "fail" && "border-status-fail/50",
        metric.status === "warn" && "border-status-warn/50"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-xs text-muted-foreground">
            {metric.id}
          </span>
        </div>
        <StatusIcon status={metric.status} />
      </div>

      <h4 className="font-medium text-sm mb-1">{metric.name}</h4>
      <p className="text-xs text-muted-foreground mb-3">{metric.description}</p>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Target</span>
          <span className="font-mono">{metric.target}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Current</span>
          <span
            className={cn(
              "font-mono font-medium",
              metric.status === "pass" && "text-status-pass",
              metric.status === "warn" && "text-status-warn",
              metric.status === "fail" && "text-status-fail"
            )}
          >
            {metric.current}
          </span>
        </div>
      </div>
    </div>
  );
}

function CriticalFailCard({ cf }: { cf: CriticalFail }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        cf.status === "pass"
          ? "bg-status-pass/5 border-status-pass/20"
          : "bg-status-fail/10 border-status-fail/50"
      )}
    >
      {cf.status === "pass" ? (
        <Check className="w-5 h-5 text-status-pass shrink-0" />
      ) : (
        <X className="w-5 h-5 text-status-fail shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {cf.id}
          </span>
          <span className="font-medium text-sm">{cf.name}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {cf.description}
        </p>
      </div>
    </div>
  );
}

interface SuccessMetricsDashboardProps {
  showCriticalFails?: boolean;
  compact?: boolean;
}

export function SuccessMetricsDashboard({
  showCriticalFails = true,
  compact = false,
}: SuccessMetricsDashboardProps) {
  const medicalMetrics = useMemo(
    () => successMetrics.filter((m) => m.category === "medical"),
    []
  );
  const engineeringMetrics = useMemo(
    () => successMetrics.filter((m) => m.category === "engineering"),
    []
  );
  const medicalCFs = useMemo(
    () => criticalFails.filter((cf) => cf.category === "medical"),
    []
  );
  const engineeringCFs = useMemo(
    () => criticalFails.filter((cf) => cf.category === "engineering"),
    []
  );

  // Calculate summary stats
  const medicalPassing = medicalMetrics.filter(
    (m) => m.status === "pass"
  ).length;
  const engineeringPassing = engineeringMetrics.filter(
    (m) => m.status === "pass"
  ).length;
  const medicalCFsPassing = medicalCFs.filter(
    (cf) => cf.status === "pass"
  ).length;
  const engineeringCFsPassing = engineeringCFs.filter(
    (cf) => cf.status === "pass"
  ).length;

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Compact Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">A-Metrics (Medical)</span>
              <span
                className={cn(
                  "text-sm font-mono",
                  medicalPassing === medicalMetrics.length
                    ? "text-status-pass"
                    : "text-status-warn"
                )}
              >
                {medicalPassing}/{medicalMetrics.length}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-status-pass rounded-full transition-all"
                style={{
                  width: `${(medicalPassing / medicalMetrics.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">B-Metrics (Engineering)</span>
              <span
                className={cn(
                  "text-sm font-mono",
                  engineeringPassing === engineeringMetrics.length
                    ? "text-status-pass"
                    : "text-status-warn"
                )}
              >
                {engineeringPassing}/{engineeringMetrics.length}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-status-pass rounded-full transition-all"
                style={{
                  width: `${(engineeringPassing / engineeringMetrics.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {showCriticalFails && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Medical CFs</span>
                <span
                  className={cn(
                    "text-sm font-mono",
                    medicalCFsPassing === medicalCFs.length
                      ? "text-status-pass"
                      : "text-status-fail"
                  )}
                >
                  {medicalCFsPassing}/{medicalCFs.length} clear
                </span>
              </div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engineering CFs</span>
                <span
                  className={cn(
                    "text-sm font-mono",
                    engineeringCFsPassing === engineeringCFs.length
                      ? "text-status-pass"
                      : "text-status-fail"
                  )}
                >
                  {engineeringCFsPassing}/{engineeringCFs.length} clear
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4 text-center">
          <div
            className={cn(
              "text-3xl font-bold",
              medicalPassing === medicalMetrics.length
                ? "text-status-pass"
                : "text-status-warn"
            )}
          >
            {medicalPassing}/{medicalMetrics.length}
          </div>
          <div className="text-sm text-muted-foreground">A-Metrics Passing</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <div
            className={cn(
              "text-3xl font-bold",
              engineeringPassing === engineeringMetrics.length
                ? "text-status-pass"
                : "text-status-warn"
            )}
          >
            {engineeringPassing}/{engineeringMetrics.length}
          </div>
          <div className="text-sm text-muted-foreground">B-Metrics Passing</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <div
            className={cn(
              "text-3xl font-bold",
              medicalCFsPassing === medicalCFs.length
                ? "text-status-pass"
                : "text-status-fail"
            )}
          >
            {medicalCFsPassing}/{medicalCFs.length}
          </div>
          <div className="text-sm text-muted-foreground">Medical CFs Clear</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <div
            className={cn(
              "text-3xl font-bold",
              engineeringCFsPassing === engineeringCFs.length
                ? "text-status-pass"
                : "text-status-fail"
            )}
          >
            {engineeringCFsPassing}/{engineeringCFs.length}
          </div>
          <div className="text-sm text-muted-foreground">Engineering CFs Clear</div>
        </div>
      </div>

      {/* A-Metrics (Medical) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">A-Metrics (Medical KPIs)</h3>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
            Layer 3
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {medicalMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* B-Metrics (Engineering) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">B-Metrics (Engineering KPIs)</h3>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
            Layer 0-2
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {engineeringMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* Critical Fails */}
      {showCriticalFails && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-status-fail" />
              <h3 className="text-lg font-semibold">Medical Critical Fails</h3>
            </div>
            <div className="space-y-2">
              {medicalCFs.map((cf) => (
                <CriticalFailCard key={cf.id} cf={cf} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-status-fail" />
              <h3 className="text-lg font-semibold">Engineering Critical Fails</h3>
            </div>
            <div className="space-y-2">
              {engineeringCFs.map((cf) => (
                <CriticalFailCard key={cf.id} cf={cf} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
