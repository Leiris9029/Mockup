import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StepPageLayout } from "@/components/layout/StepPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Minus,
  Check,
  Loader2,
  Trash2,
  Edit2,
  Database,
  AlertCircle,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  FileText,
  Shield,
  Activity,
  Wand2,
  Brain,
  BookOpen,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore, CriteriaItem } from "@/store/useProjectStore";
import { ThinkingPanel } from "@/components/thinking";
import { ThinkingStep, ThinkingSession } from "@/types/thinking";

export default function CohortPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, setCohortSpec, completeStep, setCurrentStep } = useProjectStore();

  const [isApplying, setIsApplying] = useState(false);
  const [cohortDefined, setCohortDefined] = useState(false);
  const [newCriteriaText, setNewCriteriaText] = useState("");
  const [newCriteriaType, setNewCriteriaType] = useState<"include" | "exclude">("include");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [showReasoningDetail, setShowReasoningDetail] = useState(false);
  const [userFeedback, setUserFeedback] = useState<"agree" | "disagree" | null>(null);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isThinkingPanelOpen, setIsThinkingPanelOpen] = useState(false);

  // Thinking panel steps for cohort definition
  const thinkingSteps: ThinkingStep[] = [
    {
      id: "step-1",
      title: "Analyzing Research Protocol",
      status: "pending",
      reasoning: "Reviewing the uploaded protocol to understand target population and research requirements. Looking for subject eligibility criteria and clinical characteristics.",
      evidence: [
        {
          id: "ev-1-1",
          type: "taskspec",
          title: "Study Type",
          detail: "Sleep Spindle Detection study requiring healthy adult subjects",
          icon: FileText,
        },
        {
          id: "ev-1-2",
          type: "taskspec",
          title: "Population",
          detail: "Adults with normal sleep patterns for baseline analysis",
          icon: Users,
        },
      ],
      conclusion: "Protocol targets healthy adults for sleep pattern analysis.",
      isInterventionPoint: false,
    },
    {
      id: "step-2",
      title: "Reviewing Clinical Standards",
      status: "pending",
      reasoning: "Consulting sleep research guidelines (AASM) for standard inclusion/exclusion criteria. Ensuring compliance with established research protocols.",
      evidence: [
        {
          id: "ev-2-1",
          type: "literature",
          title: "AASM Guidelines",
          detail: "Minimum 4 hours sleep recording for spindle analysis",
          icon: BookOpen,
        },
        {
          id: "ev-2-2",
          type: "literature",
          title: "Age Standards",
          detail: "18-65 years recommended for adult sleep studies",
          icon: BookOpen,
        },
      ],
      conclusion: "Standard sleep research criteria identified from AASM guidelines.",
      isInterventionPoint: false,
    },
    {
      id: "step-3",
      title: "Assessing Data Quality Needs",
      status: "pending",
      reasoning: "Determining data quality thresholds based on ML model requirements. High artifact levels can compromise training data quality.",
      evidence: [
        {
          id: "ev-3-1",
          type: "qc_result",
          title: "Artifact Threshold",
          detail: ">30% artifact rate significantly impacts model performance",
          icon: Shield,
        },
        {
          id: "ev-3-2",
          type: "data",
          title: "Signal Quality",
          detail: "Standard montage required for consistent channel mapping",
          icon: Database,
        },
      ],
      conclusion: "Quality thresholds set to ensure reliable training data.",
      isInterventionPoint: false,
    },
    {
      id: "step-4",
      title: "Generating Cohort Criteria",
      status: "pending",
      reasoning: "Synthesizing protocol requirements, clinical standards, and data quality needs into comprehensive inclusion/exclusion criteria.",
      evidence: [],
      conclusion: "6 criteria recommended: 3 inclusion, 3 exclusion.",
      confidence: 93,
      isInterventionPoint: true,
      recommendation: {
        value: "recommended",
        alternatives: [
          { id: "strict", label: "Strict Criteria", description: "Tighter thresholds for higher quality cohort" },
          { id: "relaxed", label: "Relaxed Criteria", description: "Broader criteria for larger sample size" },
        ],
      },
    },
  ];

  // Thinking session state
  const [thinkingSession, setThinkingSession] = useState<ThinkingSession>({
    id: "cohort-session",
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
        id: "cohort-session",
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
      applyRecommendation();
      toast({
        title: "Criteria Approved",
        description: "Recommended criteria have been applied.",
      });
    } else if (action === "modify" && value) {
      toast({
        title: "Criteria Modified",
        description: `${value === "strict" ? "Strict" : "Relaxed"} criteria will be applied.`,
      });
    } else if (action === "reject") {
      toast({
        title: "Recommendation Rejected",
        description: "Please define criteria manually below.",
        variant: "destructive",
      });
    }
    setIsThinkingPanelOpen(false);
  }, [toast]);

  const [criteria, setCriteria] = useState<CriteriaItem[]>([
    { id: "1", text: "Age 18-65 years", type: "include", enabled: true },
    { id: "2", text: "Confirmed epilepsy diagnosis", type: "include", enabled: true },
    { id: "3", text: "EEG recording available", type: "include", enabled: true },
    { id: "4", text: "Severe cognitive impairment", type: "exclude", enabled: true },
    { id: "5", text: "Other neurological disorders", type: "exclude", enabled: true },
    { id: "6", text: "Poor EEG quality (artifact > 30%)", type: "exclude", enabled: true },
  ]);

  // Load existing data from store
  useEffect(() => {
    if (currentProject?.cohortSpec) {
      setCriteria(currentProject.cohortSpec.criteria);
      setCohortDefined(true);
    }
  }, [currentProject]);

  const includeCriteria = criteria.filter(c => c.type === "include");
  const excludeCriteria = criteria.filter(c => c.type === "exclude");

  // AI recommendation reasoning (TaskSpec based)
  const cohortRecommendationReasons = [
    {
      factor: "Protocol Based",
      detail: "Identified as Sleep Spindle Detection study from uploaded protocol. Applying inclusion/exclusion criteria based on sleep research standard protocols.",
      icon: FileText,
    },
    {
      factor: "Data Quality Standards",
      detail: "Data with >30% artifacts degrades model training quality. Additional verification will be performed in QC step.",
      icon: Shield,
    },
    {
      factor: "Clinical Validity",
      detail: "Age range 18-65 targets adults with stable sleep patterns. Patients with cognitive impairment may have different sleep structures and are excluded.",
      icon: Activity,
    },
  ];

  // Recommended criteria (generated based on research protocol)
  const recommendedCriteria: CriteriaItem[] = [
    { id: "rec_1", text: "Age 18-65 years", type: "include", enabled: true },
    { id: "rec_2", text: "PSG recording with standard montage", type: "include", enabled: true },
    { id: "rec_3", text: "Minimum 4 hours of sleep recording", type: "include", enabled: true },
    { id: "rec_4", text: "Severe sleep apnea (AHI > 30)", type: "exclude", enabled: true },
    { id: "rec_5", text: "Use of sedative medications", type: "exclude", enabled: true },
    { id: "rec_6", text: "Poor EEG quality (artifact > 30%)", type: "exclude", enabled: true },
  ];

  const applyRecommendation = () => {
    setCriteria(recommendedCriteria);
    setCohortDefined(false);
    toast({
      title: "Recommendation Applied",
      description: "Protocol-based inclusion/exclusion criteria have been applied."
    });
  };

  const toggleCriteria = (id: string) => {
    setCriteria(prev =>
      prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c)
    );
    setCohortDefined(false);
  };

  const addCriteria = () => {
    if (!newCriteriaText.trim()) return;

    const newItem: CriteriaItem = {
      id: `criteria_${Date.now()}`,
      text: newCriteriaText.trim(),
      type: newCriteriaType,
      enabled: true,
    };

    setCriteria(prev => [...prev, newItem]);
    setNewCriteriaText("");
    setIsAddDialogOpen(false);
    setCohortDefined(false);
    toast({
      title: "Criterion Added",
      description: `Added ${newCriteriaType === "include" ? "inclusion" : "exclusion"} criterion.`,
    });
  };

  const deleteCriteria = (id: string) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
    setCohortDefined(false);
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    setCriteria(prev =>
      prev.map(c => c.id === id ? { ...c, text: editText.trim() } : c)
    );
    setEditingId(null);
    setEditText("");
    setCohortDefined(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleApply = async () => {
    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Calculate mock stats based on criteria and dataset
    const enabledInclude = includeCriteria.filter(c => c.enabled).length;
    const enabledExclude = excludeCriteria.filter(c => c.enabled).length;
    const total = currentProject?.datasetManifest?.files?.length || 100;

    const cohortStats = {
      total: total,
      afterInclusion: Math.max(Math.round(total * 0.67), total - enabledInclude * Math.ceil(total * 0.04)),
      afterExclusion: Math.max(Math.round(total * 0.53), total - enabledInclude * Math.ceil(total * 0.04) - enabledExclude * Math.ceil(total * 0.07)),
      labelPositive: Math.floor((total - enabledInclude * Math.ceil(total * 0.04) - enabledExclude * Math.ceil(total * 0.07)) * 0.33),
      labelNegative: Math.floor((total - enabledInclude * Math.ceil(total * 0.04) - enabledExclude * Math.ceil(total * 0.07)) * 0.67),
    };

    // Save to store
    setCohortSpec({
      criteria,
      stats: cohortStats,
    });
    completeStep(3);
    setCurrentStep(4);

    setIsApplying(false);
    setCohortDefined(true);
    toast({
      title: "Cohort Defined",
      description: "CohortSpec has been created successfully.",
    });
  };

  const handleNext = () => {
    navigate("/data/qc");
  };

  // Get total from dataset manifest or use default (100 for demo)
  const datasetTotal = currentProject?.datasetManifest?.files?.length || 100;

  // Use stored stats or calculate mock stats
  const cohortStats = currentProject?.cohortSpec?.stats || {
    total: datasetTotal,
    afterInclusion: Math.round(datasetTotal * 0.88),
    afterExclusion: Math.round(datasetTotal * 0.68),
    labelPositive: Math.round(datasetTotal * 0.68 * 0.33),
    labelNegative: Math.round(datasetTotal * 0.68 * 0.67),
  };

  const renderCriteriaItem = (item: CriteriaItem, type: "include" | "exclude") => {
    const isEditing = editingId === item.id;
    const bgClass = type === "include"
      ? (item.enabled ? "bg-status-pass/5 border-status-pass/30" : "bg-muted/30 border-transparent")
      : (item.enabled ? "bg-status-fail/5 border-status-fail/30" : "bg-muted/30 border-transparent");

    return (
      <div
        key={item.id}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border transition-colors group",
          bgClass
        )}
      >
        <Checkbox
          checked={item.enabled}
          onCheckedChange={() => toggleCriteria(item.id)}
        />
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="h-8"
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit(item.id);
                if (e.key === "Escape") cancelEdit();
              }}
              autoFocus
            />
            <Button size="sm" variant="ghost" onClick={() => saveEdit(item.id)}>
              <Check className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <span className={cn("text-sm flex-1", !item.enabled && "text-muted-foreground")}>
              {item.text}
            </span>
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => startEdit(item.id, item.text)}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={() => deleteCriteria(item.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <StepPageLayout
      stepNumber={3}
      title="Cohort Definition"
      description="Filter research subjects from loaded dataset. Final cohort is determined by inclusion/exclusion criteria."
      prevPath="/setup/dataset"
      nextPath="/data/qc"
      onNext={handleNext}
    >
      {/* Dataset Summary - Show what data we're filtering */}
      {currentProject?.datasetManifest ? (
        <div className="card-elevated p-4 flex items-center gap-4 bg-muted/30">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-medium">Loaded Dataset</div>
            <div className="text-sm text-muted-foreground">
              {currentProject.datasetManifest.files?.length || 0} files · {currentProject.datasetManifest.format} · {currentProject.datasetManifest.totalSize}
            </div>
          </div>
          <Badge variant="secondary" className="bg-status-pass/10 text-status-pass">
            Loaded
          </Badge>
        </div>
      ) : (
        <div className="card-elevated p-4 flex items-center gap-4 bg-status-warn/10 border-status-warn/30">
          <AlertCircle className="w-6 h-6 text-status-warn" />
          <div className="flex-1">
            <div className="font-medium text-status-warn">No Dataset Found</div>
            <div className="text-sm text-muted-foreground">
              Please load data in the Dataset Setup step first.
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendation Card */}
      {!cohortDefined && (
        <div className="card-elevated p-6 border-l-4 border-l-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">AI Recommended Inclusion/Exclusion Criteria</h3>
                  <Badge className="bg-status-pass/10 text-status-pass border-0 text-xs">
                    Protocol Based
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Analyzing uploaded protocol to recommend appropriate criteria
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
                  toast({ title: "Thank you for your feedback", description: "Recommended criteria will be applied." });
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
              <label className="text-sm font-medium mb-2 block">What criteria should be different?</label>
              <textarea
                className="w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={3}
                placeholder="e.g., I want to limit age range to 20-50 / Certain medication users should also be included..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowFeedbackInput(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => {
                  if (feedbackText.trim()) {
                    toast({ title: "Feedback Submitted", description: "Your input will be considered for criteria adjustment." });
                    setShowFeedbackInput(false);
                  }
                }}>
                  Submit Feedback
                </Button>
              </div>
            </div>
          )}

          {/* Recommended Criteria Summary */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-primary">Recommended Criteria Summary</span>
              <Badge variant="outline" className="text-xs">
                Include {recommendedCriteria.filter(c => c.type === "include").length} ·
                Exclude {recommendedCriteria.filter(c => c.type === "exclude").length}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs font-medium text-status-pass mb-1">Inclusion Criteria</div>
                <ul className="space-y-1">
                  {recommendedCriteria.filter(c => c.type === "include").map(c => (
                    <li key={c.id} className="text-muted-foreground flex items-start gap-1">
                      <Plus className="w-3 h-3 text-status-pass mt-0.5 shrink-0" />
                      {c.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-medium text-status-fail mb-1">Exclusion Criteria</div>
                <ul className="space-y-1">
                  {recommendedCriteria.filter(c => c.type === "exclude").map(c => (
                    <li key={c.id} className="text-muted-foreground flex items-start gap-1">
                      <Minus className="w-3 h-3 text-status-fail mt-0.5 shrink-0" />
                      {c.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Apply Recommendation Button */}
          <div className="flex justify-center gap-3 mb-4">
            <Button className="gap-2" onClick={applyRecommendation}>
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
                Why these criteria?
              </>
            )}
          </button>

          {/* Detailed Reasoning */}
          {showReasoningDetail && (
            <div className="mt-4 space-y-3">
              {cohortRecommendationReasons.map((reason, index) => (
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inclusion Criteria */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-status-pass/20 flex items-center justify-center">
                <Plus className="w-4 h-4 text-status-pass" />
              </div>
              <h3 className="font-semibold">Inclusion Criteria</h3>
            </div>
            <Badge variant="secondary">
              {includeCriteria.filter(c => c.enabled).length}
            </Badge>
          </div>

          <div className="space-y-2">
            {includeCriteria.map(item => renderCriteriaItem(item, "include"))}
            <Dialog open={isAddDialogOpen && newCriteriaType === "include"} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (open) setNewCriteriaType("include");
            }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full text-primary">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Criterion
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Inclusion Criterion</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Enter inclusion criterion..."
                    value={newCriteriaText}
                    onChange={(e) => setNewCriteriaText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addCriteria();
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addCriteria} disabled={!newCriteriaText.trim()}>
                      Add
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Exclusion Criteria */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-status-fail/20 flex items-center justify-center">
                <Minus className="w-4 h-4 text-status-fail" />
              </div>
              <h3 className="font-semibold">Exclusion Criteria</h3>
            </div>
            <Badge variant="secondary">
              {excludeCriteria.filter(c => c.enabled).length}
            </Badge>
          </div>

          <div className="space-y-2">
            {excludeCriteria.map(item => renderCriteriaItem(item, "exclude"))}
            <Dialog open={isAddDialogOpen && newCriteriaType === "exclude"} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (open) setNewCriteriaType("exclude");
            }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full text-primary">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Criterion
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Exclusion Criterion</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Enter exclusion criterion..."
                    value={newCriteriaText}
                    onChange={(e) => setNewCriteriaText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addCriteria();
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addCriteria} disabled={!newCriteriaText.trim()}>
                      Add
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      {!cohortDefined && (
        <Button
          size="lg"
          className="w-full"
          onClick={handleApply}
          disabled={isApplying}
        >
          {isApplying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Applying Criteria...
            </>
          ) : (
            "Apply Cohort Criteria"
          )}
        </Button>
      )}

      {/* Cohort Result */}
      {cohortDefined && (
        <div className="space-y-4">
          {/* Funnel Visualization - Step by Step */}
          <div className="card-elevated p-6">
            <h4 className="font-semibold mb-2 text-center">Cohort Filtering Results</h4>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Subject count changes based on inclusion/exclusion criteria
            </p>

            <div className="space-y-4 max-w-xl mx-auto">
              {/* Step 1: Total */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold">{cohortStats.total}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">Total Data</div>
                  <div className="text-sm text-muted-foreground">
                    All patient records in database
                  </div>
                </div>
              </div>

              {/* Arrow with exclusion info */}
              <div className="flex items-center gap-2 pl-8">
                <div className="w-0.5 h-6 bg-status-pass/50" />
                <span className="text-xs text-status-pass">
                  Inclusion criteria applied → {cohortStats.total - cohortStats.afterInclusion} excluded
                </span>
              </div>

              {/* Step 2: After Inclusion */}
              <div className="flex items-center gap-4 p-4 bg-status-pass/10 rounded-lg border border-status-pass/30">
                <div className="w-16 h-16 rounded-full bg-status-pass/20 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-status-pass">{cohortStats.afterInclusion}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-status-pass">Passed Inclusion Criteria</div>
                  <div className="text-sm text-muted-foreground">
                    {includeCriteria.filter(c => c.enabled).map(c => c.text).join(", ")} conditions met
                  </div>
                </div>
              </div>

              {/* Arrow with exclusion info */}
              <div className="flex items-center gap-2 pl-8">
                <div className="w-0.5 h-6 bg-status-fail/50" />
                <span className="text-xs text-status-fail">
                  Exclusion criteria applied → {cohortStats.afterInclusion - cohortStats.afterExclusion} excluded
                </span>
              </div>

              {/* Step 3: Final Cohort */}
              <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg border border-primary/30">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-primary">{cohortStats.afterExclusion}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-primary">Final Study Subjects</div>
                  <div className="text-sm text-muted-foreground">
                    Analysis targets that passed all inclusion/exclusion criteria
                  </div>
                </div>
                <Badge className="bg-primary/20 text-primary border-0">
                  {((cohortStats.afterExclusion / cohortStats.total) * 100).toFixed(0)}% Selected
                </Badge>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="flex items-center gap-2 p-4 bg-status-pass/10 rounded-lg border border-status-pass/30">
            <Check className="w-5 h-5 text-status-pass" />
            <span className="text-status-pass font-medium">
              Cohort definition complete. {cohortStats.afterExclusion} final study subjects selected.
            </span>
          </div>
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
