import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StepPageLayout } from "@/components/layout/StepPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Check,
  AlertTriangle,
  X,
  Play,
  Loader2,
  ChevronDown,
  ChevronUp,
  Wrench,
  FileWarning,
  Brain,
  Database,
  FileText,
  BookOpen,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore, QCCheck } from "@/store/useProjectStore";
import { ThinkingPanel } from "@/components/thinking";
import { ThinkingStep, ThinkingSession } from "@/types/thinking";

interface QCCheckExtended extends QCCheck {
  threshold: string;
  warnReason?: string;
  suggestedActions?: string[];
  affectedFiles?: string[];
}

export default function QCPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, setQCResult, completeStep, setCurrentStep } = useProjectStore();

  const [isRunning, setIsRunning] = useState(false);
  const [qcComplete, setQcComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const [isThinkingPanelOpen, setIsThinkingPanelOpen] = useState(false);

  // Thinking panel steps for QC process
  const thinkingSteps: ThinkingStep[] = [
    {
      id: "step-1",
      title: "Analyzing Dataset Structure",
      status: "pending",
      reasoning: "Examining the dataset manifest to understand file formats, channel configurations, and recording parameters across all files.",
      evidence: [
        {
          id: "ev-1-1",
          type: "data",
          title: "File Count",
          detail: `${currentProject?.datasetManifest?.files?.length || 100} EDF files detected`,
          icon: Database,
        },
        {
          id: "ev-1-2",
          type: "data",
          title: "Format",
          detail: "EDF+ format with 19 channels at 256Hz",
          icon: FileText,
        },
      ],
      conclusion: "Dataset structure verified. Ready for quality checks.",
      isInterventionPoint: false,
    },
    {
      id: "step-2",
      title: "Determining QC Thresholds",
      status: "pending",
      reasoning: "Setting appropriate quality thresholds based on task requirements (Sleep Spindle Detection) and clinical standards.",
      evidence: [
        {
          id: "ev-2-1",
          type: "literature",
          title: "Signal Quality",
          detail: "SNR >= 10dB required for reliable spindle detection",
          icon: BookOpen,
        },
        {
          id: "ev-2-2",
          type: "taskspec",
          title: "Artifact Tolerance",
          detail: "< 10% artifact rate for clean training data",
          icon: Activity,
        },
      ],
      conclusion: "QC thresholds set based on sleep analysis requirements.",
      isInterventionPoint: false,
    },
    {
      id: "step-3",
      title: "Planning QC Checks",
      status: "pending",
      reasoning: "Selecting appropriate quality checks based on data type and downstream analysis needs.",
      evidence: [
        {
          id: "ev-3-1",
          type: "qc_result",
          title: "Check Categories",
          detail: "Signal quality, channel consistency, sampling rate, duration, PHI, integrity",
          icon: Shield,
        },
      ],
      conclusion: "6 QC checks planned for comprehensive data validation.",
      isInterventionPoint: false,
    },
    {
      id: "step-4",
      title: "Ready to Execute QC",
      status: "pending",
      reasoning: "All parameters configured. Quality control checks are ready to run on the dataset.",
      evidence: [],
      conclusion: "QC pipeline configured with appropriate thresholds.",
      confidence: 100,
      isInterventionPoint: true,
      recommendation: {
        value: "run_qc",
        alternatives: [
          { id: "strict", label: "Strict Mode", description: "Tighter thresholds for research-grade data" },
          { id: "lenient", label: "Lenient Mode", description: "Relaxed thresholds for exploratory analysis" },
        ],
      },
    },
  ];

  // Thinking session state
  const [thinkingSession, setThinkingSession] = useState<ThinkingSession>({
    id: "qc-session",
    pageContext: "preprocess",
    steps: thinkingSteps,
    currentStepIndex: 0,
    status: "idle",
    interventions: [],
  });

  // Reset thinking session when panel opens
  useEffect(() => {
    if (isThinkingPanelOpen) {
      setThinkingSession({
        id: "qc-session",
        pageContext: "preprocess",
        steps: thinkingSteps.map(step => ({ ...step, status: "pending" as const })),
        currentStepIndex: 0,
        status: "idle",
        interventions: [],
      });
    }
  }, [isThinkingPanelOpen]);

  // Handle thinking panel intervention
  const handleThinkingIntervention = useCallback((action: 'approve' | 'modify' | 'reject', value?: string) => {
    if (action === "approve") {
      toast({
        title: "QC Configuration Approved",
        description: "Running QC checks with standard thresholds.",
      });
      runQC();
    } else if (action === "modify" && value) {
      toast({
        title: "QC Mode Modified",
        description: `Running QC in ${value === "strict" ? "strict" : "lenient"} mode.`,
      });
      runQC();
    } else if (action === "reject") {
      toast({
        title: "Configuration Rejected",
        description: "Please adjust QC parameters manually.",
        variant: "destructive",
      });
    }
    setIsThinkingPanelOpen(false);
  }, [toast]);

  const [checks, setChecks] = useState<QCCheckExtended[]>([
    {
      id: "1",
      name: "Signal Quality",
      description: "Check SNR and artifact ratio",
      threshold: "SNR >= 10dB, Artifact < 10%",
      status: "pending"
    },
    {
      id: "2",
      name: "Channel Consistency",
      description: "Verify channel labels and montage",
      threshold: "Identical channel configuration across all files",
      status: "pending"
    },
    {
      id: "3",
      name: "Sampling Rate",
      description: "Validate consistent sampling frequency",
      threshold: "256Hz or 512Hz (consistent)",
      status: "pending"
    },
    {
      id: "4",
      name: "Duration Check",
      description: "Verify minimum recording length",
      threshold: "Minimum 3 minutes",
      status: "pending"
    },
    {
      id: "5",
      name: "PHI Scan",
      description: "Check for protected health information",
      threshold: "No PHI detected",
      status: "pending"
    },
    {
      id: "6",
      name: "Data Integrity",
      description: "Verify file checksums",
      threshold: "All checksums valid",
      status: "pending"
    },
  ]);

  // Load existing data from store
  useEffect(() => {
    if (currentProject?.qcResult) {
      setChecks(currentProject.qcResult.checks);
      setQcComplete(true);
    }
  }, [currentProject]);

  const runQC = async () => {
    setIsRunning(true);
    setProgress(0);

    // Simulate running each check with detailed results
    const results: Partial<QCCheckExtended>[] = [
      {
        status: "pass" as const,
        value: "SNR: 12.4 dB, Artifact: 4.2%",
      },
      {
        status: "pass" as const,
        value: "19/19 channels matched",
      },
      {
        status: "pass" as const,
        value: "256 Hz (consistent)",
      },
      {
        status: "pass" as const,
        value: "All files >= 3 min",
      },
      {
        status: "pass" as const,
        value: "No PHI detected",
      },
      {
        status: "pass" as const,
        value: "All checksums valid",
      },
    ];

    for (let i = 0; i < checks.length; i++) {
      setChecks(prev =>
        prev.map((c, idx) => idx === i ? { ...c, status: "running" } : c)
      );
      setProgress(((i) / checks.length) * 100);

      await new Promise(resolve => setTimeout(resolve, 500));

      setChecks(prev =>
        prev.map((c, idx) =>
          idx === i ? { ...c, ...results[i] } : c
        )
      );
      setProgress(((i + 1) / checks.length) * 100);
    }

    // Calculate final results
    const finalChecks = checks.map((c, i) => ({
      ...c,
      ...results[i],
    }));

    const passCount = finalChecks.filter(c => c.status === "pass").length;
    const warnCount = finalChecks.filter(c => c.status === "warn").length;
    const failCount = finalChecks.filter(c => c.status === "fail").length;

    // Save to store
    setQCResult({
      checks: finalChecks,
      passCount,
      warnCount,
      failCount,
      gateStatus: failCount === 0 ? "pass" : "fail",
    });
    completeStep(4);
    setCurrentStep(5);

    setIsRunning(false);
    setQcComplete(true);

    // Auto-expand warning items
    const warnCheck = finalChecks.find(c => c.status === "warn");
    if (warnCheck) {
      setExpandedCheck(warnCheck.id);
    }

    toast({
      title: "QC Complete",
      description: `Quality check complete. ${passCount} passed, ${warnCount} warnings, ${failCount} failed.`,
    });
  };

  const handleNext = () => {
    navigate("/data/split");
  };

  const passCount = checks.filter(c => c.status === "pass").length;
  const warnCount = checks.filter(c => c.status === "warn").length;
  const failCount = checks.filter(c => c.status === "fail").length;

  const getStatusIcon = (status: QCCheck["status"]) => {
    switch (status) {
      case "pass":
        return <Check className="w-5 h-5 text-status-pass" />;
      case "warn":
        return <AlertTriangle className="w-5 h-5 text-status-warn" />;
      case "fail":
        return <X className="w-5 h-5 text-status-fail" />;
      case "running":
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <StepPageLayout
      stepNumber={4}
      title="Quality Control"
      description="Data quality verification before AI training. Automatically checks signal quality, channel consistency, sampling rate, duration, PHI, and integrity."
      prevPath="/setup/cohort"
      nextPath="/data/split"
      onNext={handleNext}
    >
      {/* Run QC Button */}
      {!qcComplete && (
        <div className="card-elevated p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>

          <h3 className="text-xl font-semibold mb-2">
            {isRunning ? "Running Quality Checks..." : "Ready to Run QC"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {isRunning
              ? "Please wait while we validate your dataset."
              : "Click below to start automated quality control checks."
            }
          </p>

          {isRunning && (
            <div className="max-w-md mx-auto mb-6">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <Button
              size="lg"
              onClick={runQC}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run QC Checks
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => setIsThinkingPanelOpen(true)}
              disabled={isRunning}
            >
              <Brain className="w-4 h-4" />
              View AI Thinking
            </Button>
          </div>
        </div>
      )}

      {/* QC Checks List */}
      <div className="card-elevated overflow-hidden">
        <div className="p-4 border-b">
          <h4 className="font-semibold">QC Check Items</h4>
        </div>

        <div className="divide-y">
          {checks.map(check => (
            <div key={check.id}>
              <div
                className={cn(
                  "p-4 flex items-center gap-4 transition-colors cursor-pointer",
                  check.status === "running" && "bg-primary/5",
                  check.status === "warn" && "bg-status-warn/5",
                  check.status === "fail" && "bg-status-fail/5",
                  (check.status === "warn" || check.status === "fail") && "hover:bg-muted/50"
                )}
                onClick={() => {
                  if (check.status === "warn" || check.status === "fail") {
                    setExpandedCheck(expandedCheck === check.id ? null : check.id);
                  }
                }}
              >
                {getStatusIcon(check.status)}

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{check.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {check.value || check.description}
                  </div>
                  {check.status === "pending" && (
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      Threshold: {check.threshold}
                    </div>
                  )}
                </div>

                {check.status !== "pending" && check.status !== "running" && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        check.status === "pass" && "bg-status-pass/10 text-status-pass",
                        check.status === "warn" && "bg-status-warn/10 text-status-warn",
                        check.status === "fail" && "bg-status-fail/10 text-status-fail"
                      )}
                    >
                      {check.status === "pass" ? "Pass" : check.status === "warn" ? "Warning" : "Fail"}
                    </Badge>
                    {(check.status === "warn" || check.status === "fail") && (
                      expandedCheck === check.id ?
                        <ChevronUp className="w-4 h-4 text-muted-foreground" /> :
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>

              {/* Expanded Warning/Fail Details */}
              {expandedCheck === check.id && (check.status === "warn" || check.status === "fail") && (
                <div className={cn(
                  "px-4 pb-4 pt-0",
                  check.status === "warn" ? "bg-status-warn/5" : "bg-status-fail/5"
                )}>
                  <div className="ml-9 space-y-4">
                    {/* Reason */}
                    {check.warnReason && (
                      <div className="p-3 bg-background rounded-lg border">
                        <div className="flex items-start gap-2">
                          <FileWarning className={cn(
                            "w-4 h-4 mt-0.5 shrink-0",
                            check.status === "warn" ? "text-status-warn" : "text-status-fail"
                          )} />
                          <div>
                            <div className="text-sm font-medium mb-1">
                              {check.status === "warn" ? "Warning Reason" : "Failure Reason"}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {check.warnReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Affected Files */}
                    {check.affectedFiles && check.affectedFiles.length > 0 && (
                      <div className="p-3 bg-background rounded-lg border">
                        <div className="text-sm font-medium mb-2">Affected Files</div>
                        <ul className="space-y-1">
                          {check.affectedFiles.map((file, i) => (
                            <li key={i} className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-status-warn" />
                              {file}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Suggested Actions */}
                    {check.suggestedActions && check.suggestedActions.length > 0 && (
                      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-start gap-2">
                          <Wrench className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-primary mb-2">Suggested Actions</div>
                            <ul className="space-y-1">
                              {check.suggestedActions.map((action, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary font-medium">{i + 1}.</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {qcComplete && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="card-elevated p-4 text-center">
              <div className="text-3xl font-bold text-status-pass">{passCount}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-3xl font-bold text-status-warn">{warnCount}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-3xl font-bold text-status-fail">{failCount}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>

          {/* Gate Status */}
          <div
            className={cn(
              "flex items-center gap-2 p-4 rounded-lg border",
              failCount === 0
                ? "bg-status-pass/10 border-status-pass/30"
                : "bg-status-fail/10 border-status-fail/30"
            )}
          >
            {failCount === 0 ? (
              <>
                <Check className="w-5 h-5 text-status-pass" />
                <span className="text-status-pass font-medium">
                  QC Gate Passed. Proceed to Split Plan.
                </span>
              </>
            ) : (
              <>
                <X className="w-5 h-5 text-status-fail" />
                <span className="text-status-fail font-medium">
                  QC Gate Failed. Fix issues before proceeding.
                </span>
              </>
            )}
          </div>
        </>
      )}

      {/* AI Thinking Panel */}
      <ThinkingPanel
        isOpen={isThinkingPanelOpen}
        onClose={() => setIsThinkingPanelOpen(false)}
        session={thinkingSession}
        onSessionUpdate={setThinkingSession}
        onIntervention={handleThinkingIntervention}
      />
    </StepPageLayout>
  );
}
