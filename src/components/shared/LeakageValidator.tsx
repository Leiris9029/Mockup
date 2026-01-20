import {
  Shield,
  Check,
  X,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  Users,
  Clock,
  Database,
  Shuffle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type RuleStatus = "pass" | "fail" | "warn" | "pending";

interface LeakageRule {
  id: string;
  name: string;
  description: string;
  status: RuleStatus;
  details: string;
  icon: React.ComponentType<{ className?: string }>;
  checkTime?: string;
  evidence?: string[];
}

// PRD Leakage Validator 5-rule check
const leakageRules: LeakageRule[] = [
  {
    id: "L1",
    name: "Patient-Level Split",
    description: "No patient appears in both train and test sets",
    status: "pass",
    details: "Verified 0 patient overlap across 1,234 unique patients",
    icon: Users,
    checkTime: "2.3s",
    evidence: [
      "Train set: 865 patients",
      "Test set: 369 patients",
      "Overlap: 0 patients",
      "Split method: Patient ID hash",
    ],
  },
  {
    id: "L2",
    name: "Temporal Ordering",
    description: "No future information used in prediction",
    status: "pass",
    details: "All features derived from t < t_prediction",
    icon: Clock,
    checkTime: "1.8s",
    evidence: [
      "Prediction window: 30 min before event",
      "Feature window: 60 min before prediction",
      "No overlap detected",
      "Time-series validation passed",
    ],
  },
  {
    id: "L3",
    name: "Label Independence",
    description: "Labels not derived from features or model outputs",
    status: "pass",
    details: "Label source independent of feature extraction pipeline",
    icon: FileText,
    checkTime: "0.9s",
    evidence: [
      "Label source: Clinical annotations",
      "Feature source: Raw EEG signals",
      "No shared columns between label and feature tables",
      "Annotation timestamp verified independent",
    ],
  },
  {
    id: "L4",
    name: "Data Preprocessing",
    description: "No train-set statistics leaked to test set",
    status: "pass",
    details: "Normalization fitted on train, applied to test",
    icon: Database,
    checkTime: "1.2s",
    evidence: [
      "Scaler fit: Train set only",
      "Mean/Std computed: Train set only",
      "Imputation strategy: Train-derived",
      "No cross-contamination detected",
    ],
  },
  {
    id: "L5",
    name: "Cross-Validation Integrity",
    description: "Fold assignments respect patient boundaries",
    status: "pass",
    details: "Group K-Fold with patient_id as group key",
    icon: Shuffle,
    checkTime: "3.1s",
    evidence: [
      "CV method: GroupKFold (k=5)",
      "Group key: patient_id",
      "No patient split across folds",
      "All folds validated",
    ],
  },
];

function StatusIcon({ status, size = "md" }: { status: RuleStatus; size?: "sm" | "md" }) {
  const iconClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  switch (status) {
    case "pass":
      return <Check className={cn(iconClass, "text-status-pass")} />;
    case "fail":
      return <X className={cn(iconClass, "text-status-fail")} />;
    case "warn":
      return <AlertTriangle className={cn(iconClass, "text-status-warn")} />;
    default:
      return <Info className={cn(iconClass, "text-muted-foreground")} />;
  }
}

function LeakageRuleCard({ rule }: { rule: LeakageRule }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = rule.icon;

  return (
    <div
      className={cn(
        "rounded-lg border transition-colors",
        rule.status === "pass" && "bg-status-pass/5 border-status-pass/20",
        rule.status === "fail" && "bg-status-fail/10 border-status-fail/50",
        rule.status === "warn" && "bg-status-warn/10 border-status-warn/50",
        rule.status === "pending" && "bg-muted/30 border-muted"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        <div
          className={cn(
            "p-2 rounded-lg",
            rule.status === "pass" && "bg-status-pass/20",
            rule.status === "fail" && "bg-status-fail/20",
            rule.status === "warn" && "bg-status-warn/20",
            rule.status === "pending" && "bg-muted"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              {rule.id}
            </span>
            <span className="font-medium">{rule.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">{rule.description}</p>
        </div>
        <div className="flex items-center gap-3">
          {rule.checkTime && (
            <span className="text-xs text-muted-foreground font-mono">
              {rule.checkTime}
            </span>
          )}
          <StatusIcon status={rule.status} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 ml-12">
          <div className="bg-background/50 rounded-lg p-3">
            <div className="text-sm mb-2">{rule.details}</div>
            {rule.evidence && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">
                  Evidence:
                </div>
                {rule.evidence.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Check className="w-3 h-3 text-status-pass" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface LeakageValidatorProps {
  compact?: boolean;
  rules?: LeakageRule[];
}

export function LeakageValidator({
  compact = false,
  rules = leakageRules,
}: LeakageValidatorProps) {
  const passCount = rules.filter((r) => r.status === "pass").length;
  const failCount = rules.filter((r) => r.status === "fail").length;
  const warnCount = rules.filter((r) => r.status === "warn").length;

  const overallStatus: RuleStatus =
    failCount > 0 ? "fail" : warnCount > 0 ? "warn" : "pass";

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border",
          overallStatus === "pass" && "bg-status-pass/5 border-status-pass/20",
          overallStatus === "fail" && "bg-status-fail/10 border-status-fail/50",
          overallStatus === "warn" && "bg-status-warn/10 border-status-warn/50"
        )}
      >
        <Shield
          className={cn(
            "w-5 h-5",
            overallStatus === "pass" && "text-status-pass",
            overallStatus === "fail" && "text-status-fail",
            overallStatus === "warn" && "text-status-warn"
          )}
        />
        <div className="flex-1">
          <div className="font-medium text-sm">Leakage Validator</div>
          <div className="text-xs text-muted-foreground">5-rule check</div>
        </div>
        <div className="flex items-center gap-1">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={cn(
                "w-6 h-6 rounded flex items-center justify-center text-xs font-mono",
                rule.status === "pass" && "bg-status-pass/20 text-status-pass",
                rule.status === "fail" && "bg-status-fail/20 text-status-fail",
                rule.status === "warn" && "bg-status-warn/20 text-status-warn"
              )}
              title={`${rule.id}: ${rule.name}`}
            >
              {rule.id.replace("L", "")}
            </div>
          ))}
        </div>
        <span
          className={cn(
            "text-sm font-mono font-medium",
            overallStatus === "pass" && "text-status-pass",
            overallStatus === "fail" && "text-status-fail",
            overallStatus === "warn" && "text-status-warn"
          )}
        >
          {passCount}/{rules.length}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-4 p-4 rounded-lg border",
          overallStatus === "pass" && "bg-status-pass/5 border-status-pass/20",
          overallStatus === "fail" && "bg-status-fail/10 border-status-fail/50",
          overallStatus === "warn" && "bg-status-warn/10 border-status-warn/50"
        )}
      >
        <div
          className={cn(
            "p-3 rounded-lg",
            overallStatus === "pass" && "bg-status-pass/20",
            overallStatus === "fail" && "bg-status-fail/20",
            overallStatus === "warn" && "bg-status-warn/20"
          )}
        >
          <Shield
            className={cn(
              "w-6 h-6",
              overallStatus === "pass" && "text-status-pass",
              overallStatus === "fail" && "text-status-fail",
              overallStatus === "warn" && "text-status-warn"
            )}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">Leakage Validator</h3>
          <p className="text-sm text-muted-foreground">
            5-rule check for data leakage prevention
          </p>
        </div>
        <div className="text-right">
          <div
            className={cn(
              "text-3xl font-bold",
              overallStatus === "pass" && "text-status-pass",
              overallStatus === "fail" && "text-status-fail",
              overallStatus === "warn" && "text-status-warn"
            )}
          >
            {passCount}/{rules.length}
          </div>
          <div className="text-sm text-muted-foreground">Rules Passing</div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-status-pass/5 border border-status-pass/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-status-pass">{passCount}</div>
          <div className="text-xs text-muted-foreground">Passed</div>
        </div>
        <div className="bg-status-warn/5 border border-status-warn/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-status-warn">{warnCount}</div>
          <div className="text-xs text-muted-foreground">Warnings</div>
        </div>
        <div className="bg-status-fail/5 border border-status-fail/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-status-fail">{failCount}</div>
          <div className="text-xs text-muted-foreground">Failed</div>
        </div>
      </div>

      {/* Rule Cards */}
      <div className="space-y-2">
        {rules.map((rule) => (
          <LeakageRuleCard key={rule.id} rule={rule} />
        ))}
      </div>

      {/* Critical Fail Notice */}
      {failCount > 0 && (
        <div className="flex items-start gap-3 p-4 bg-status-fail/10 border border-status-fail/50 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-status-fail shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-status-fail">
              Critical Fail: CF-M1 Data Leakage Detected
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Pipeline cannot proceed until all leakage rules pass. This is a
              blocking issue that must be resolved before training.
            </p>
          </div>
        </div>
      )}

      {/* Pass Notice */}
      {overallStatus === "pass" && (
        <div className="flex items-start gap-3 p-4 bg-status-pass/5 border border-status-pass/20 rounded-lg">
          <Check className="w-5 h-5 text-status-pass shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-status-pass">
              All Leakage Checks Passed
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Data split is validated for no patient overlap, temporal ordering,
              label independence, preprocessing isolation, and CV integrity.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
