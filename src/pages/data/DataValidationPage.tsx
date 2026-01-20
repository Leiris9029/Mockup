import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StepPageLayout } from "@/components/layout/StepPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Split,
  Shuffle,
  Sparkles,
  Users,
  ShieldAlert,
  BarChart3,
  Wand2,
  ThumbsUp,
  ThumbsDown,
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

interface SplitOption {
  id: string;
  name: string;
  description: string;
  ratio: string;
  recommended: boolean;
}

export default function DataValidationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, setQCResult, setSplitResult, completeStep, setCurrentStep } = useProjectStore();

  // QC State
  const [isRunningQC, setIsRunningQC] = useState(false);
  const [qcComplete, setQcComplete] = useState(false);
  const [qcProgress, setQcProgress] = useState(0);
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);

  // Split State
  const [selectedSplit, setSelectedSplit] = useState("patient");
  const [isApplyingSplit, setIsApplyingSplit] = useState(false);
  const [splitComplete, setSplitComplete] = useState(false);
  const [leakageChecked, setLeakageChecked] = useState(false);
  const [seed, setSeed] = useState(42);

  // Common State
  const [activeTab, setActiveTab] = useState("qc");
  const [isThinkingPanelOpen, setIsThinkingPanelOpen] = useState(false);
  const [userFeedback, setUserFeedback] = useState<"agree" | "disagree" | null>(null);

  // QC Checks
  const [checks, setChecks] = useState<QCCheckExtended[]>([
    { id: "1", name: "Signal Quality", description: "Check SNR and artifact ratio", threshold: "SNR >= 10dB, Artifact < 10%", status: "pending" },
    { id: "2", name: "Channel Consistency", description: "Verify channel labels and montage", threshold: "Identical channel configuration across all files", status: "pending" },
    { id: "3", name: "Sampling Rate", description: "Validate consistent sampling frequency", threshold: "256Hz or 512Hz (consistent)", status: "pending" },
    { id: "4", name: "Duration Check", description: "Verify minimum recording length", threshold: "Minimum 3 minutes", status: "pending" },
    { id: "5", name: "PHI Scan", description: "Check for protected health information", threshold: "No PHI detected", status: "pending" },
    { id: "6", name: "Data Integrity", description: "Verify file checksums", threshold: "All checksums valid", status: "pending" },
  ]);

  // Split Options
  const splitOptions: SplitOption[] = [
    { id: "patient", name: "Patient-Level Split", description: "Ensures no patient appears in multiple sets, preventing data leakage", ratio: "70 / 15 / 15", recommended: true },
    { id: "random", name: "Random Split", description: "Random sample assignment regardless of patient identity", ratio: "70 / 15 / 15", recommended: false },
    { id: "stratified", name: "Stratified Split", description: "Maintains label distribution across all sets", ratio: "70 / 15 / 15", recommended: false },
  ];

  // Thinking Steps
  const thinkingSteps: ThinkingStep[] = [
    {
      id: "step-1",
      title: "Analyzing Dataset Structure",
      status: "pending",
      reasoning: "Examining the dataset manifest to understand file formats, channel configurations, and recording parameters.",
      evidence: [
        { id: "ev-1-1", type: "data", title: "File Count", detail: `${currentProject?.datasetManifest?.files?.length || 100} EDF files detected`, icon: Database },
        { id: "ev-1-2", type: "data", title: "Format", detail: "EDF+ format with 19 channels at 256Hz", icon: FileText },
      ],
      conclusion: "Dataset structure verified. Ready for quality checks.",
      isInterventionPoint: false,
    },
    {
      id: "step-2",
      title: "Setting QC Thresholds & Split Strategy",
      status: "pending",
      reasoning: "Determining appropriate quality thresholds and split strategy based on task requirements and clinical standards.",
      evidence: [
        { id: "ev-2-1", type: "literature", title: "Signal Quality", detail: "SNR >= 10dB required for reliable spindle detection", icon: BookOpen },
        { id: "ev-2-2", type: "literature", title: "Leakage Prevention", detail: "Patient-level split prevents 15-30% performance overestimation", icon: ShieldAlert },
      ],
      conclusion: "QC thresholds and Patient-Level Split recommended.",
      confidence: 96,
      isInterventionPoint: true,
      recommendation: {
        value: "run_validation",
        alternatives: [
          { id: "strict", label: "Strict Mode", description: "Tighter thresholds for research-grade data" },
          { id: "lenient", label: "Lenient Mode", description: "Relaxed thresholds for exploratory analysis" },
        ],
      },
    },
  ];

  const [thinkingSession, setThinkingSession] = useState<ThinkingSession>({
    id: "validation-session",
    pageContext: "preprocess",
    steps: thinkingSteps,
    currentStepIndex: 0,
    status: "idle",
    interventions: [],
  });

  // Load existing data
  useEffect(() => {
    if (currentProject?.qcResult) {
      setChecks(currentProject.qcResult.checks);
      setQcComplete(true);
    }
    if (currentProject?.splitResult) {
      setSelectedSplit(currentProject.splitResult.strategy);
      setSeed(currentProject.splitResult.seed);
      setSplitComplete(true);
      setLeakageChecked(currentProject.splitResult.leakageChecked);
    }
  }, [currentProject]);

  // Run QC
  const runQC = async () => {
    setIsRunningQC(true);
    setQcProgress(0);

    const results: Partial<QCCheckExtended>[] = [
      { status: "pass" as const, value: "SNR: 12.4 dB, Artifact: 4.2%" },
      { status: "pass" as const, value: "19/19 channels matched" },
      { status: "pass" as const, value: "256 Hz (consistent)" },
      { status: "pass" as const, value: "All files >= 3 min" },
      { status: "pass" as const, value: "No PHI detected" },
      { status: "pass" as const, value: "All checksums valid" },
    ];

    for (let i = 0; i < checks.length; i++) {
      setChecks(prev => prev.map((c, idx) => idx === i ? { ...c, status: "running" } : c));
      setQcProgress(((i) / checks.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 400));
      setChecks(prev => prev.map((c, idx) => idx === i ? { ...c, ...results[i] } : c));
      setQcProgress(((i + 1) / checks.length) * 100);
    }

    const finalChecks = checks.map((c, i) => ({ ...c, ...results[i] }));
    const passCount = finalChecks.filter(c => c.status === "pass").length;
    const warnCount = finalChecks.filter(c => c.status === "warn").length;
    const failCount = finalChecks.filter(c => c.status === "fail").length;

    setQCResult({
      checks: finalChecks,
      passCount,
      warnCount,
      failCount,
      gateStatus: failCount === 0 ? "pass" : "fail",
    });

    setIsRunningQC(false);
    setQcComplete(true);
    setActiveTab("split");

    toast({
      title: "QC Complete",
      description: `Quality check complete. ${passCount} passed. Proceeding to Split configuration.`,
    });
  };

  // Apply Split
  const handleApplySplit = async () => {
    setIsApplyingSplit(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLeakageChecked(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const splitResults = {
      strategy: selectedSplit,
      seed,
      train: { subjects: 99, samples: 1485, positive: 495, negative: 990 },
      val: { subjects: 21, samples: 315, positive: 105, negative: 210 },
      test: { subjects: 22, samples: 330, positive: 110, negative: 220 },
      leakageChecked: true,
    };

    setSplitResult(splitResults);
    completeStep(3);
    setCurrentStep(4);

    setIsApplyingSplit(false);
    setSplitComplete(true);
    toast({
      title: "Data Validation Complete",
      description: "QC passed and data split with no leakage detected.",
    });
  };

  // Run All (AI Recommended)
  const runAllValidation = async () => {
    await runQC();
    setTimeout(() => {
      handleApplySplit();
    }, 500);
  };

  const handleThinkingIntervention = useCallback((action: 'approve' | 'modify' | 'reject', value?: string) => {
    if (action === "approve") {
      toast({ title: "Configuration Approved", description: "Running validation with recommended settings." });
      runAllValidation();
    } else if (action === "modify") {
      toast({ title: "Configuration Modified", description: `Running in ${value} mode.` });
      runAllValidation();
    } else {
      toast({ title: "Rejected", description: "Please configure manually.", variant: "destructive" });
    }
    setIsThinkingPanelOpen(false);
  }, [toast]);

  const handleNext = () => navigate("/data/preprocess");

  const passCount = checks.filter(c => c.status === "pass").length;
  const warnCount = checks.filter(c => c.status === "warn").length;
  const failCount = checks.filter(c => c.status === "fail").length;

  const splitResults = currentProject?.splitResult || {
    train: { subjects: 99, samples: 1485, positive: 495, negative: 990 },
    val: { subjects: 21, samples: 315, positive: 105, negative: 210 },
    test: { subjects: 22, samples: 330, positive: 110, negative: 220 },
  };
  const totalSubjects = splitResults.train.subjects + splitResults.val.subjects + splitResults.test.subjects;

  const getStatusIcon = (status: QCCheck["status"]) => {
    switch (status) {
      case "pass": return <Check className="w-5 h-5 text-status-pass" />;
      case "warn": return <AlertTriangle className="w-5 h-5 text-status-warn" />;
      case "fail": return <X className="w-5 h-5 text-status-fail" />;
      case "running": return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-muted" />;
    }
  };

  const allComplete = qcComplete && splitComplete;

  return (
    <StepPageLayout
      stepNumber={3}
      title="Data Validation"
      description="Quality control and data splitting. AI automatically runs QC checks and recommends optimal split strategy to prevent data leakage."
      prevPath="/setup/data"
      nextPath="/data/preprocess"
      onNext={handleNext}
    >
      {/* AI Quick Action - Only show when not complete */}
      {!allComplete && (
        <div className="card-elevated p-6 border-l-4 border-l-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">AI Recommended Validation</h3>
                <p className="text-sm text-muted-foreground">
                  Run QC checks and apply Patient-Level Split automatically
                </p>
              </div>
            </div>
            <Badge className="bg-status-pass/10 text-status-pass border-0">96% Confidence</Badge>
          </div>

          <div className="flex justify-center gap-3">
            <Button className="gap-2" onClick={runAllValidation} disabled={isRunningQC || isApplyingSplit}>
              {(isRunningQC || isApplyingSplit) ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Running...</>
              ) : (
                <><Wand2 className="w-4 h-4" />Run All Validation</>
              )}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setIsThinkingPanelOpen(true)}>
              <Brain className="w-4 h-4" />View AI Thinking
            </Button>
          </div>
        </div>
      )}

      {/* Tabs for QC and Split */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="card-elevated">
        <div className="border-b px-4">
          <TabsList className="h-12 bg-transparent">
            <TabsTrigger value="qc" className="gap-2">
              <Shield className="w-4 h-4" />
              Quality Control
              {qcComplete && <Check className="w-3 h-3 text-status-pass ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="split" className="gap-2">
              <Split className="w-4 h-4" />
              Data Split
              {splitComplete && <Check className="w-3 h-3 text-status-pass ml-1" />}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* QC Tab */}
        <TabsContent value="qc" className="p-6">
          {!qcComplete && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {isRunningQC ? "Running Quality Checks..." : "Ready for QC"}
              </h3>
              {isRunningQC && (
                <div className="max-w-md mx-auto mb-4">
                  <Progress value={qcProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">{Math.round(qcProgress)}% complete</p>
                </div>
              )}
              {!isRunningQC && (
                <Button onClick={runQC}><Play className="w-4 h-4 mr-2" />Run QC Checks</Button>
              )}
            </div>
          )}

          {/* QC Checks List */}
          <div className="divide-y">
            {checks.map(check => (
              <div key={check.id} className={cn(
                "p-4 flex items-center gap-4 transition-colors",
                check.status === "running" && "bg-primary/5"
              )}>
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="font-medium">{check.name}</div>
                  <div className="text-sm text-muted-foreground">{check.value || check.description}</div>
                </div>
                {check.status !== "pending" && check.status !== "running" && (
                  <Badge variant="secondary" className={cn(
                    check.status === "pass" && "bg-status-pass/10 text-status-pass",
                    check.status === "warn" && "bg-status-warn/10 text-status-warn",
                    check.status === "fail" && "bg-status-fail/10 text-status-fail"
                  )}>
                    {check.status === "pass" ? "Pass" : check.status === "warn" ? "Warning" : "Fail"}
                  </Badge>
                )}
              </div>
            ))}
          </div>

          {qcComplete && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-status-pass/10 rounded-lg">
                <div className="text-2xl font-bold text-status-pass">{passCount}</div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
              <div className="text-center p-3 bg-status-warn/10 rounded-lg">
                <div className="text-2xl font-bold text-status-warn">{warnCount}</div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center p-3 bg-status-fail/10 rounded-lg">
                <div className="text-2xl font-bold text-status-fail">{failCount}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Split Tab */}
        <TabsContent value="split" className="p-6">
          {!qcComplete && (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Complete QC checks first to configure split</p>
            </div>
          )}

          {qcComplete && !splitComplete && (
            <>
              <div className="space-y-3 mb-6">
                {splitOptions.map(option => (
                  <label
                    key={option.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                      selectedSplit === option.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="split"
                      value={option.id}
                      checked={selectedSplit === option.id}
                      onChange={(e) => setSelectedSplit(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.name}</span>
                        {option.recommended && (
                          <Badge className="bg-primary/10 text-primary border-0">Recommended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                    </div>
                    <div className="text-sm font-mono text-muted-foreground">{option.ratio}</div>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg mb-4">
                <div>
                  <div className="font-medium">Random Seed</div>
                  <div className="text-sm text-muted-foreground">For reproducibility</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-2 border rounded-lg text-center font-mono"
                  />
                  <Button variant="outline" size="sm" onClick={() => setSeed(Math.floor(Math.random() * 1000))}>
                    <Shuffle className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button className="w-full" onClick={handleApplySplit} disabled={isApplyingSplit}>
                {isApplyingSplit ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{leakageChecked ? "Creating Split..." : "Checking Leakage..."}</>
                ) : (
                  <><Split className="w-4 h-4 mr-2" />Apply Split & Check Leakage</>
                )}
              </Button>
            </>
          )}

          {splitComplete && (
            <>
              <div className="flex items-center gap-2 p-4 bg-status-pass/10 rounded-lg border border-status-pass/30 mb-4">
                <Check className="w-5 h-5 text-status-pass" />
                <span className="text-status-pass font-medium">No data leakage detected. Patient-level isolation confirmed.</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: "Train", color: "bg-primary", ...splitResults.train },
                  { name: "Validation", color: "bg-status-warn", ...splitResults.val },
                  { name: "Test", color: "bg-status-pass", ...splitResults.test },
                ].map(set => (
                  <div key={set.name} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn("w-3 h-3 rounded-full", set.color)} />
                      <span className="font-semibold">{set.name}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {Math.round((set.subjects / totalSubjects) * 100)}%
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Subjects</span><span className="font-mono">{set.subjects}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Samples</span><span className="font-mono">{set.samples}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Overall Status */}
      {allComplete && (
        <div className="flex items-center gap-2 p-4 bg-status-pass/10 rounded-lg border border-status-pass/30">
          <Check className="w-5 h-5 text-status-pass" />
          <span className="text-status-pass font-medium">
            Data Validation complete. QC passed and data split ready. Proceed to Preprocessing.
          </span>
        </div>
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
