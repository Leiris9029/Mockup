import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StepPageLayout } from "@/components/layout/StepPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Split,
  Check,
  Shuffle,
  Loader2,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Users,
  ShieldAlert,
  BarChart3,
  Wand2,
  Brain,
  Database,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore } from "@/store/useProjectStore";
import { ThinkingPanel } from "@/components/thinking";
import { ThinkingStep, ThinkingSession } from "@/types/thinking";

interface SplitOption {
  id: string;
  name: string;
  description: string;
  ratio: string;
  recommended: boolean;
}

export default function SplitPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, setSplitResult, completeStep, setCurrentStep } = useProjectStore();

  const [selectedSplit, setSelectedSplit] = useState("patient");
  const [isApplying, setIsApplying] = useState(false);
  const [splitComplete, setSplitComplete] = useState(false);
  const [leakageChecked, setLeakageChecked] = useState(false);
  const [seed, setSeed] = useState(42);
  const [showReasoningDetail, setShowReasoningDetail] = useState(false);
  const [userFeedback, setUserFeedback] = useState<"agree" | "disagree" | null>(null);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isThinkingPanelOpen, setIsThinkingPanelOpen] = useState(false);

  // Split options - defined early for use in callbacks
  const splitOptions: SplitOption[] = [
    {
      id: "patient",
      name: "Patient-Level Split",
      description: "Ensures no patient appears in multiple sets, preventing data leakage",
      ratio: "70 / 15 / 15",
      recommended: true,
    },
    {
      id: "random",
      name: "Random Split",
      description: "Random sample assignment regardless of patient identity",
      ratio: "70 / 15 / 15",
      recommended: false,
    },
    {
      id: "stratified",
      name: "Stratified Split",
      description: "Maintains label distribution across all sets",
      ratio: "70 / 15 / 15",
      recommended: false,
    },
  ];

  // Thinking panel steps for split strategy
  const thinkingSteps: ThinkingStep[] = [
    {
      id: "step-1",
      title: "Analyzing Data Structure",
      status: "pending",
      reasoning: "Examining the dataset manifest to understand the hierarchical structure. Each patient has multiple overnight recordings with several epochs per recording.",
      evidence: [
        {
          id: "ev-1-1",
          type: "data",
          title: "Patient Count",
          detail: `${currentProject?.datasetManifest?.files?.length || 142} unique patients in dataset`,
          icon: Users,
        },
        {
          id: "ev-1-2",
          type: "data",
          title: "Data Hierarchy",
          detail: "Patient → Recording → Epoch structure",
          icon: Database,
        },
      ],
      conclusion: "Multi-level data structure requires patient-level grouping to prevent leakage.",
      isInterventionPoint: false,
    },
    {
      id: "step-2",
      title: "Evaluating Leakage Risk",
      status: "pending",
      reasoning: "Assessing the risk of data leakage if samples from the same patient appear in different splits. This is a critical issue in medical ML that leads to overestimated performance.",
      evidence: [
        {
          id: "ev-2-1",
          type: "literature",
          title: "Common ML Pitfall",
          detail: "Random splitting causes 15-30% performance overestimation in medical imaging",
          icon: ShieldAlert,
        },
        {
          id: "ev-2-2",
          type: "literature",
          title: "Roberts et al. 2021",
          detail: "87% of COVID-19 imaging studies had data leakage issues",
          icon: BookOpen,
        },
      ],
      conclusion: "High leakage risk identified. Patient-level split is essential for valid evaluation.",
      isInterventionPoint: false,
    },
    {
      id: "step-3",
      title: "Assessing Clinical Applicability",
      status: "pending",
      reasoning: "Considering how the model will be used in clinical practice. The model will be applied to entirely new patients, so test set should simulate this scenario.",
      evidence: [
        {
          id: "ev-3-1",
          type: "taskspec",
          title: "Deployment Scenario",
          detail: "Model will classify new patient recordings in clinical setting",
          icon: BarChart3,
        },
      ],
      conclusion: "Patient-level split accurately simulates real-world deployment conditions.",
      isInterventionPoint: false,
    },
    {
      id: "step-4",
      title: "Recommending Strategy",
      status: "pending",
      reasoning: "Based on data structure, leakage risk, and clinical applicability analysis, determining the optimal split strategy.",
      evidence: [],
      conclusion: "Patient-Level Split is strongly recommended with 98% confidence.",
      confidence: 98,
      isInterventionPoint: true,
      recommendation: {
        value: "patient",
        alternatives: [
          { id: "stratified", label: "Stratified Split", description: "Maintains label distribution but allows same patient in multiple sets" },
          { id: "random", label: "Random Split", description: "Simple random assignment - only for preliminary experiments" },
        ],
      },
    },
  ];

  // Thinking session state
  const [thinkingSession, setThinkingSession] = useState<ThinkingSession>({
    id: "split-session",
    pageContext: "split",
    steps: thinkingSteps,
    currentStepIndex: 0,
    status: "idle",
    interventions: [],
  });

  // Reset thinking session when panel opens
  useEffect(() => {
    if (isThinkingPanelOpen) {
      setThinkingSession({
        id: "split-session",
        pageContext: "split",
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
        title: "Strategy Approved",
        description: "Patient-Level Split has been selected.",
      });
      setSelectedSplit("patient");
    } else if (action === "modify" && value) {
      const strategyName = splitOptions.find(s => s.id === value)?.name || value;
      toast({
        title: "Strategy Modified",
        description: `${strategyName} has been selected instead.`,
      });
      setSelectedSplit(value);
    } else if (action === "reject") {
      toast({
        title: "Recommendation Rejected",
        description: "Please select a strategy manually below.",
        variant: "destructive",
      });
    }
    setIsThinkingPanelOpen(false);
  }, [toast, splitOptions]);

  // Load existing data from store
  useEffect(() => {
    if (currentProject?.splitResult) {
      setSelectedSplit(currentProject.splitResult.strategy);
      setSeed(currentProject.splitResult.seed);
      setSplitComplete(true);
      setLeakageChecked(currentProject.splitResult.leakageChecked);
    }
  }, [currentProject]);

  const handleApply = async () => {
    setIsApplying(true);

    // Simulate split + leakage check
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLeakageChecked(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock split results
    const splitResults = {
      strategy: selectedSplit,
      seed,
      train: { subjects: 99, samples: 1485, positive: 495, negative: 990 },
      val: { subjects: 21, samples: 315, positive: 105, negative: 210 },
      test: { subjects: 22, samples: 330, positive: 110, negative: 220 },
      leakageChecked: true,
    };

    // Save to store
    setSplitResult(splitResults);
    completeStep(5);
    setCurrentStep(6);

    setIsApplying(false);
    setSplitComplete(true);
    toast({
      title: "Split Plan Created",
      description: "Data has been split with no leakage detected.",
    });
  };

  const handleNext = () => {
    navigate("/data/preprocess");
  };

  // Use stored data or mock data
  const splitResults = currentProject?.splitResult || {
    train: { subjects: 99, samples: 1485, positive: 495, negative: 990 },
    val: { subjects: 21, samples: 315, positive: 105, negative: 210 },
    test: { subjects: 22, samples: 330, positive: 110, negative: 220 },
  };

  const totalSubjects = splitResults.train.subjects + splitResults.val.subjects + splitResults.test.subjects;

  // AI recommendation reasons
  const splitRecommendationReasons = [
    {
      factor: "Data Structure",
      detail: `${currentProject?.datasetManifest?.files?.length || 100} patient records with multiple recordings per patient. Patient-level split is essential.`,
      icon: Users,
    },
    {
      factor: "Leakage Risk",
      detail: "Random split may include same patient's data in both Train/Test, leading to overestimated performance. This is the most common mistake in medical AI.",
      icon: ShieldAlert,
    },
    {
      factor: "Clinical Applicability",
      detail: "In clinical practice, models are applied to new patients. Patient-level split accurately simulates this scenario.",
      icon: BarChart3,
    },
  ];

  return (
    <StepPageLayout
      stepNumber={5}
      title="Split Plan"
      description="Split data into Train (70%) / Validation (15%) / Test (15%). Patient-level split prevents data leakage by ensuring the same patient doesn't appear in multiple sets."
      prevPath="/data/qc"
      nextPath="/data/preprocess"
      onNext={handleNext}
    >
      {/* AI Recommendation Card */}
      {!splitComplete && (
        <div className="card-elevated p-6 border-l-4 border-l-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">AI Recommended Strategy</h3>
                  <Badge className="bg-status-pass/10 text-status-pass border-0 text-xs">
                    98% Confidence
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on medical AI research standards
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={userFeedback === "agree" ? "default" : "outline"}
                size="sm"
                className="gap-1"
                onClick={() => {
                  setUserFeedback("agree");
                  setShowFeedbackInput(false);
                  toast({ title: "Thank you for your feedback", description: "Patient-level split will be applied." });
                }}
              >
                <ThumbsUp className="w-3 h-3" />
                Agree
              </Button>
              <Button
                variant={userFeedback === "disagree" ? "destructive" : "outline"}
                size="sm"
                className="gap-1"
                onClick={() => {
                  setUserFeedback("disagree");
                  setShowFeedbackInput(true);
                }}
              >
                <ThumbsDown className="w-3 h-3" />
                Disagree
              </Button>
            </div>
          </div>

          {/* Feedback Input */}
          {showFeedbackInput && (
            <div className="mb-4 p-4 bg-status-warn/5 rounded-lg border border-status-warn/20">
              <label className="text-sm font-medium mb-2 block">Why do you think a different strategy is more appropriate?</label>
              <textarea
                className="w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={3}
                placeholder="e.g., I have enough data to use stratified split for class balance / I want to use random split for quick experimentation..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowFeedbackInput(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => {
                  if (feedbackText.trim()) {
                    toast({ title: "Feedback submitted", description: "We will take your input into consideration." });
                    setShowFeedbackInput(false);
                  }
                }}>
                  Submit Feedback
                </Button>
              </div>
            </div>
          )}

          {/* Recommended Strategy Highlight */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary">Patient-Level Split</span>
                <Badge variant="outline" className="text-xs">Recommended</Badge>
              </div>
              <span className="text-sm font-mono text-muted-foreground">70 / 15 / 15</span>
            </div>
            <p className="text-sm text-muted-foreground">
              All data from the same patient is placed in only one of Train/Val/Test, completely preventing data leakage.
            </p>
          </div>

          {/* Apply Recommendation Button */}
          <div className="flex justify-center gap-3 mb-4">
            <Button
              className="gap-2"
              onClick={() => {
                setSelectedSplit("patient");
                toast({
                  title: "Recommendation Applied",
                  description: "Patient-Level Split has been selected."
                });
              }}
            >
              <Wand2 className="w-4 h-4" />
              Apply Recommendation
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsThinkingPanelOpen(true)}
            >
              <Brain className="w-4 h-4" />
              View AI Thinking
            </Button>
          </div>

          {/* Reasoning Toggle */}
          <button
            className="flex items-center gap-2 text-sm text-primary hover:underline w-full justify-center"
            onClick={() => setShowReasoningDetail(!showReasoningDetail)}
          >
            {showReasoningDetail ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Reasoning
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Why Patient-Level Split?
              </>
            )}
          </button>

          {/* Detailed Reasoning */}
          {showReasoningDetail && (
            <div className="mt-4 space-y-3">
              {splitRecommendationReasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-8 h-8 rounded bg-background flex items-center justify-center shrink-0">
                    <reason.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{reason.factor}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{reason.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Split Strategy Selection */}
      <div className="card-elevated p-6">
        <h3 className="font-semibold mb-4">Select Split Strategy</h3>

        <div className="space-y-3">
          {splitOptions.map(option => (
            <label
              key={option.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                selectedSplit === option.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
                splitComplete && "pointer-events-none opacity-70"
              )}
            >
              <input
                type="radio"
                name="split"
                value={option.id}
                checked={selectedSplit === option.id}
                onChange={(e) => {
                  setSelectedSplit(e.target.value);
                  setSplitComplete(false);
                }}
                className="mt-1"
                disabled={splitComplete}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{option.name}</span>
                  {option.recommended && (
                    <Badge className="bg-primary/10 text-primary border-0">
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {option.description}
                </p>
              </div>
              <div className="text-sm font-mono text-muted-foreground">
                {option.ratio}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Seed Configuration */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Random Seed</h3>
            <p className="text-sm text-muted-foreground">For reproducibility</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={seed}
              onChange={(e) => {
                setSeed(parseInt(e.target.value) || 0);
                setSplitComplete(false);
              }}
              className="w-24 px-3 py-2 border rounded-lg text-center font-mono"
              disabled={splitComplete}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSeed(Math.floor(Math.random() * 1000));
                setSplitComplete(false);
              }}
              disabled={splitComplete}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      {!splitComplete && (
        <Button
          size="lg"
          className="w-full"
          onClick={handleApply}
          disabled={isApplying}
        >
          {isApplying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {leakageChecked ? "Creating Split Plan..." : "Checking for Leakage..."}
            </>
          ) : (
            <>
              <Split className="w-4 h-4 mr-2" />
              Apply Split & Check Leakage
            </>
          )}
        </Button>
      )}

      {/* Split Results */}
      {splitComplete && (
        <>
          {/* Leakage Check */}
          <div className="flex items-center gap-2 p-4 bg-status-pass/10 rounded-lg border border-status-pass/30">
            <Check className="w-5 h-5 text-status-pass" />
            <span className="text-status-pass font-medium">
              No data leakage detected. Patient-level isolation confirmed.
            </span>
          </div>

          {/* Split Distribution */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: "Train", color: "bg-primary", ...splitResults.train },
              { name: "Validation", color: "bg-status-warn", ...splitResults.val },
              { name: "Test", color: "bg-status-pass", ...splitResults.test },
            ].map(set => (
              <div key={set.name} className="card-elevated p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("w-3 h-3 rounded-full", set.color)} />
                  <span className="font-semibold">{set.name}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {Math.round((set.subjects / totalSubjects) * 100)}%
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subjects</span>
                    <span className="font-mono">{set.subjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Samples</span>
                    <span className="font-mono">{set.samples}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Positive</span>
                    <span className="font-mono">{set.positive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Negative</span>
                    <span className="font-mono">{set.negative}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card-elevated p-4">
            <div className="grid grid-cols-4 gap-4 text-sm text-center">
              <div>
                <div className="text-muted-foreground">Strategy</div>
                <div className="font-medium capitalize">
                  {splitOptions.find(o => o.id === selectedSplit)?.name || "Patient-Level"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Seed</div>
                <div className="font-mono">{seed}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Leakage</div>
                <div className="text-status-pass font-medium">None</div>
              </div>
              <div>
                <div className="text-muted-foreground">Status</div>
                <div className="text-status-pass font-medium">Ready</div>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={() => {
              setSplitComplete(false);
              setLeakageChecked(false);
            }}
          >
            Reconfigure Split
          </Button>
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
