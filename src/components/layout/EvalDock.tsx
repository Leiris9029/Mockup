import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  UserCheck,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type GateStatus = "pass" | "warn" | "fail";

interface ChecklistItem {
  label: string;
  status: GateStatus;
  evidenceLink?: string;
}

interface EvalDockProps {
  gateStatus: GateStatus;
  gateName: string;
  checklistItems: ChecklistItem[];
  whySummary: string;
  showActions?: boolean;
}

function GateStatusBadge({ status }: { status: GateStatus }) {
  const config = {
    pass: { 
      label: "PASS", 
      icon: Check, 
      className: "bg-status-pass text-status-pass-foreground" 
    },
    warn: { 
      label: "WARN", 
      icon: AlertTriangle, 
      className: "bg-status-warn text-status-warn-foreground" 
    },
    fail: { 
      label: "FAIL", 
      icon: X, 
      className: "bg-status-fail text-status-fail-foreground" 
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold", className)}>
      <Icon className="w-4 h-4" />
      {label}
    </div>
  );
}

function ChecklistItemRow({ item }: { item: ChecklistItem }) {
  const statusIcon = {
    pass: <Check className="w-3.5 h-3.5 text-status-pass" />,
    warn: <AlertTriangle className="w-3.5 h-3.5 text-status-warn" />,
    fail: <X className="w-3.5 h-3.5 text-status-fail" />,
  };

  return (
    <div className="flex items-start gap-2 text-sm">
      <div className="mt-0.5">{statusIcon[item.status]}</div>
      <div className="flex-1">
        <span className={cn(
          item.status === "pass" && "text-muted-foreground",
          item.status === "warn" && "text-foreground",
          item.status === "fail" && "text-status-fail font-medium"
        )}>
          {item.label}
        </span>
        {item.evidenceLink && (
          <button className="evidence-link ml-2">
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export function EvalDock({ gateStatus, gateName, checklistItems, whySummary, showActions = true }: EvalDockProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRerunning, setIsRerunning] = useState(false);
  const [isRequestingReview, setIsRequestingReview] = useState(false);
  const [isProceeding, setIsProceeding] = useState(false);

  const handleRerun = async () => {
    setIsRerunning(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRerunning(false);
    toast({
      title: "Re-run Initiated",
      description: "Pipeline is being re-executed with your edits...",
    });
  };

  const handleRequestReview = async () => {
    setIsRequestingReview(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRequestingReview(false);
    toast({
      title: "Review Requested",
      description: "A human reviewer has been notified.",
    });
  };

  const handleProceed = async () => {
    setIsProceeding(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Proceeding to Next Step",
      description: gateStatus === "warn" ? "Proceeding with conditional approval..." : "Moving to next stage...",
    });
    setTimeout(() => {
      navigate("/results");
    }, 500);
  };

  const handleEvidenceClick = (evidenceName: string) => {
    toast({
      title: "Opening Evidence",
      description: `Loading ${evidenceName}...`,
    });
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-dock border-l border-dock-border shrink-0 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setIsCollapsed(false)}
        >
          <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="w-72 bg-dock border-l border-dock-border shrink-0 flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Eval Dock
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsCollapsed(true)}
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <GateStatusBadge status={gateStatus} />
          <span className="text-sm font-medium">{gateName}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Checklist */}
        <div className="p-4 border-b">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Gate Checklist
          </h4>
          <div className="space-y-2.5">
            {checklistItems.map((item, index) => (
              <ChecklistItemRow key={index} item={item} />
            ))}
          </div>
        </div>

        {/* Why Summary */}
        <div className="p-4 border-b">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Why
          </h4>
          <p className="text-sm text-foreground leading-relaxed">
            {whySummary}
          </p>
        </div>

        {/* Evidence Links */}
        <div className="p-4">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Key Evidence
          </h4>
          <div className="space-y-2">
            <button
              className="evidence-link w-full justify-start"
              onClick={() => handleEvidenceClick("Data Quality Report")}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Data Quality Report
            </button>
            <button
              className="evidence-link w-full justify-start"
              onClick={() => handleEvidenceClick("Leakage Analysis")}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Leakage Analysis
            </button>
            <button
              className="evidence-link w-full justify-start"
              onClick={() => handleEvidenceClick("Validation Metrics")}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Validation Metrics
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="p-4 border-t bg-muted/30 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleRerun}
            disabled={isRerunning || isRequestingReview || isProceeding}
          >
            {isRerunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isRerunning ? "Re-running..." : "Re-run with edits"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleRequestReview}
            disabled={isRerunning || isRequestingReview || isProceeding}
          >
            {isRequestingReview ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserCheck className="w-4 h-4" />
            )}
            {isRequestingReview ? "Requesting..." : "Request human review"}
          </Button>
          <Button
            size="sm"
            className="w-full justify-start gap-2"
            disabled={gateStatus === "fail" || isRerunning || isRequestingReview || isProceeding}
            onClick={handleProceed}
          >
            {isProceeding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {isProceeding ? "Processing..." : `Proceed ${gateStatus === "warn" ? "(conditional)" : ""}`}
          </Button>
        </div>
      )}
    </aside>
  );
}
