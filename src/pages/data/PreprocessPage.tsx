import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StepPageLayout } from "@/components/layout/StepPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Check,
  Play,
  Loader2,
  Sliders,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Activity,
  Filter,
  Waves,
  Wand2,
  Brain,
  FileText,
  Database,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore, PreprocessStep } from "@/store/useProjectStore";
import { ThinkingPanel } from "@/components/thinking";
import { ThinkingStep, ThinkingSession } from "@/types/thinking";

interface StepConfig {
  id: string;
  fields: {
    name: string;
    type: "number" | "select" | "text";
    options?: string[];
    value: string;
    label: string;
  }[];
}

const defaultStepConfigs: Record<string, StepConfig["fields"]> = {
  filter: [
    { name: "lowFreq", type: "number", value: "0.5", label: "Low Frequency (Hz)" },
    { name: "highFreq", type: "number", value: "45", label: "High Frequency (Hz)" },
  ],
  notch: [
    { name: "freq", type: "select", options: ["50", "60"], value: "60", label: "Notch Frequency (Hz)" },
  ],
  reref: [
    { name: "method", type: "select", options: ["Average", "Cz", "Linked Mastoid"], value: "Average", label: "Reference Method" },
  ],
  ica: [
    { name: "components", type: "number", value: "20", label: "Number of Components" },
    { name: "method", type: "select", options: ["FastICA", "Infomax", "JADE"], value: "FastICA", label: "ICA Method" },
  ],
  epoch: [
    { name: "windowSize", type: "number", value: "30", label: "Window Size (seconds)" },
    { name: "overlap", type: "number", value: "50", label: "Overlap (%)" },
  ],
  normalize: [
    { name: "method", type: "select", options: ["Per-channel", "Global", "Robust"], value: "Per-channel", label: "Normalization Method" },
  ],
};

const presets: Record<string, PreprocessStep[]> = {
  default: [
    { id: "filter", name: "Bandpass Filter", description: "Remove low and high frequency noise", enabled: true, config: "0.5 - 45 Hz" },
    { id: "notch", name: "Notch Filter", description: "Remove power line interference", enabled: true, config: "60 Hz" },
    { id: "reref", name: "Re-referencing", description: "Apply common average reference", enabled: true, config: "Average" },
    { id: "ica", name: "ICA Artifact Removal", description: "Remove eye blinks and muscle artifacts", enabled: true, config: "20 components" },
    { id: "epoch", name: "Epoching", description: "Segment continuous data", enabled: true, config: "30s windows, 50% overlap" },
    { id: "normalize", name: "Normalization", description: "Z-score normalization per channel", enabled: true, config: "Per-channel" },
  ],
  sleep: [
    { id: "filter", name: "Bandpass Filter", description: "Remove low and high frequency noise", enabled: true, config: "0.3 - 35 Hz" },
    { id: "notch", name: "Notch Filter", description: "Remove power line interference", enabled: true, config: "60 Hz" },
    { id: "reref", name: "Re-referencing", description: "Apply common average reference", enabled: true, config: "Linked Mastoid" },
    { id: "ica", name: "ICA Artifact Removal", description: "Remove eye blinks and muscle artifacts", enabled: true, config: "15 components" },
    { id: "epoch", name: "Epoching", description: "Segment continuous data", enabled: true, config: "30s windows, 0% overlap" },
    { id: "normalize", name: "Normalization", description: "Z-score normalization per channel", enabled: true, config: "Per-channel" },
  ],
  epilepsy: [
    { id: "filter", name: "Bandpass Filter", description: "Remove low and high frequency noise", enabled: true, config: "0.5 - 70 Hz" },
    { id: "notch", name: "Notch Filter", description: "Remove power line interference", enabled: true, config: "60 Hz" },
    { id: "reref", name: "Re-referencing", description: "Apply common average reference", enabled: true, config: "Average" },
    { id: "ica", name: "ICA Artifact Removal", description: "Remove eye blinks and muscle artifacts", enabled: true, config: "25 components" },
    { id: "epoch", name: "Epoching", description: "Segment continuous data", enabled: true, config: "10s windows, 50% overlap" },
    { id: "normalize", name: "Normalization", description: "Z-score normalization per channel", enabled: true, config: "Robust" },
  ],
  minimal: [
    { id: "filter", name: "Bandpass Filter", description: "Remove low and high frequency noise", enabled: true, config: "1 - 40 Hz" },
    { id: "notch", name: "Notch Filter", description: "Remove power line interference", enabled: false, config: "60 Hz" },
    { id: "reref", name: "Re-referencing", description: "Apply common average reference", enabled: false, config: "Average" },
    { id: "ica", name: "ICA Artifact Removal", description: "Remove eye blinks and muscle artifacts", enabled: false, config: "20 components" },
    { id: "epoch", name: "Epoching", description: "Segment continuous data", enabled: true, config: "30s windows, 0% overlap" },
    { id: "normalize", name: "Normalization", description: "Z-score normalization per channel", enabled: true, config: "Per-channel" },
  ],
};

export default function PreprocessPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, setPreprocessResult, completeStep, setCurrentStep } = useProjectStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [processComplete, setProcessComplete] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<PreprocessStep | null>(null);
  const [stepConfigs, setStepConfigs] = useState<Record<string, StepConfig["fields"]>>(defaultStepConfigs);
  const [showReasoningDetail, setShowReasoningDetail] = useState(false);
  const [userFeedback, setUserFeedback] = useState<"agree" | "disagree" | null>(null);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isThinkingPanelOpen, setIsThinkingPanelOpen] = useState(false);

  const [steps, setSteps] = useState<PreprocessStep[]>(presets.default);

  // Thinking panel steps for preprocessing pipeline
  const thinkingSteps: ThinkingStep[] = [
    {
      id: "step-1",
      title: "Analyzing Task Requirements",
      status: "pending",
      reasoning: "Examining the research protocol to understand signal processing needs. Sleep spindle detection requires preserving 12-15Hz oscillations while removing noise and artifacts.",
      evidence: [
        {
          id: "ev-1-1",
          type: "taskspec",
          title: "Target Frequency",
          detail: "Sleep spindles occur at 12-15Hz (sigma band)",
          icon: FileText,
        },
        {
          id: "ev-1-2",
          type: "taskspec",
          title: "Duration",
          detail: "Spindles last 0.5-2 seconds, requiring appropriate windowing",
          icon: Activity,
        },
      ],
      conclusion: "Pipeline must preserve sigma band while removing low/high frequency artifacts.",
      isInterventionPoint: false,
    },
    {
      id: "step-2",
      title: "Evaluating Signal Quality",
      status: "pending",
      reasoning: "Reviewing QC results to determine artifact removal needs. Overnight recordings typically contain eye movements, muscle artifacts, and electrode drift.",
      evidence: [
        {
          id: "ev-2-1",
          type: "qc_result",
          title: "Artifact Presence",
          detail: "Eye blinks detected in 78% of recordings, muscle artifacts in 45%",
          icon: Filter,
        },
        {
          id: "ev-2-2",
          type: "data",
          title: "Recording Quality",
          detail: "89% of files passed QC thresholds after artifact removal",
          icon: Database,
        },
      ],
      conclusion: "ICA-based artifact removal recommended for optimal signal quality.",
      isInterventionPoint: false,
    },
    {
      id: "step-3",
      title: "Optimizing Parameters",
      status: "pending",
      reasoning: "Determining optimal filter settings and epoch parameters based on task requirements and literature recommendations.",
      evidence: [
        {
          id: "ev-3-1",
          type: "literature",
          title: "AASM Guidelines",
          detail: "30-second epochs standard for sleep staging",
          icon: BookOpen,
        },
        {
          id: "ev-3-2",
          type: "literature",
          title: "Filter Settings",
          detail: "0.3-35Hz bandpass recommended for sleep EEG analysis",
          icon: Waves,
        },
      ],
      conclusion: "Sleep-optimized parameters: 0.3-35Hz filter, 30s epochs, ICA artifact removal.",
      isInterventionPoint: false,
    },
    {
      id: "step-4",
      title: "Recommending Pipeline",
      status: "pending",
      reasoning: "Based on task requirements, signal quality, and parameter optimization, recommending the optimal preprocessing pipeline.",
      evidence: [],
      conclusion: "Sleep Study preset recommended with 6-step pipeline optimized for spindle detection.",
      confidence: 95,
      isInterventionPoint: true,
      recommendation: {
        value: "sleep",
        alternatives: [
          { id: "default", label: "Default EEG", description: "General-purpose pipeline with broader frequency range" },
          { id: "minimal", label: "Minimal", description: "Basic filtering only - for quick experiments" },
          { id: "epilepsy", label: "Epilepsy", description: "Optimized for spike detection with higher frequency range" },
        ],
      },
    },
  ];

  // Thinking session state
  const [thinkingSession, setThinkingSession] = useState<ThinkingSession>({
    id: "preprocess-session",
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
        id: "preprocess-session",
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
      applyPreset("sleep");
      toast({
        title: "Pipeline Approved",
        description: "Sleep Study preset has been applied.",
      });
    } else if (action === "modify" && value) {
      applyPreset(value);
      const presetName = value === "default" ? "Default EEG" :
                        value === "minimal" ? "Minimal" :
                        value === "epilepsy" ? "Epilepsy" : value;
      toast({
        title: "Pipeline Modified",
        description: `${presetName} preset has been applied.`,
      });
    } else if (action === "reject") {
      toast({
        title: "Recommendation Rejected",
        description: "Please configure the pipeline manually below.",
        variant: "destructive",
      });
    }
    setIsThinkingPanelOpen(false);
  }, [toast]);

  // AI recommendation reasons
  const preprocessRecommendationReasons = [
    {
      factor: "Task Characteristics",
      detail: "Sleep Spindle Detection occurs in the 12-15Hz band. A 0.5-45Hz bandpass filter preserves relevant frequencies while removing noise.",
      icon: Activity,
    },
    {
      factor: "Signal Quality",
      detail: "QC results detected artifacts in some files. ICA automatically removes eye blink/EMG artifacts to improve signal quality.",
      icon: Filter,
    },
    {
      factor: "Model Input",
      detail: "CNN-LSTM models recommend 30-second window input. 50% overlap reduces boundary effects and augments training data.",
      icon: Waves,
    },
  ];

  // Load existing data from store
  useEffect(() => {
    if (currentProject?.preprocessResult) {
      setSteps(currentProject.preprocessResult.steps);
      setProcessComplete(true);
    }
  }, [currentProject]);

  const toggleStep = (id: string) => {
    setSteps(prev =>
      prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    );
    setProcessComplete(false);
    setSelectedPreset(null);
  };

  const applyPreset = (presetName: string) => {
    setSteps(presets[presetName]);
    setSelectedPreset(presetName);
    setProcessComplete(false);
    toast({
      title: "Preset Applied",
      description: `${presetName.charAt(0).toUpperCase() + presetName.slice(1)} preset loaded.`,
    });
  };

  const openConfigDialog = (step: PreprocessStep) => {
    setEditingStep(step);
    setConfigDialogOpen(true);
  };

  const saveStepConfig = () => {
    if (!editingStep) return;

    const config = stepConfigs[editingStep.id];
    const configString = config.map(f => `${f.value}`).join(", ");

    setSteps(prev =>
      prev.map(s => s.id === editingStep.id ? { ...s, config: configString } : s)
    );

    setConfigDialogOpen(false);
    setEditingStep(null);
    setProcessComplete(false);
    setSelectedPreset(null);
  };

  const handleProcess = async () => {
    setIsProcessing(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Calculate mock stats
    const enabledSteps = steps.filter(s => s.enabled).length;
    const stats = {
      filesProcessed: 142,
      epochsCreated: 2130 + Math.floor(Math.random() * 200),
      artifactRate: 3.5 + Math.random() * 2,
      avgSNR: 11.5 + Math.random() * 2,
    };

    // Save to store
    setPreprocessResult({
      steps,
      stats,
    });
    completeStep(6);
    setCurrentStep(7);

    setIsProcessing(false);
    setProcessComplete(true);
    toast({
      title: "Preprocessing Complete",
      description: "PreprocessRecipe has been saved.",
    });
  };

  const handleNext = () => {
    navigate("/train");
  };

  const enabledSteps = steps.filter(s => s.enabled).length;

  // Use stored stats or defaults
  const stats = currentProject?.preprocessResult?.stats || {
    filesProcessed: 142,
    epochsCreated: 2130,
    artifactRate: 4.2,
    avgSNR: 12.4,
  };

  const handleFeedbackSubmit = () => {
    if (feedbackText.trim()) {
      toast({
        title: "Feedback Submitted",
        description: "Your input will be used to adjust the pipeline.",
      });
      setShowFeedbackInput(false);
    }
  };

  return (
    <StepPageLayout
      stepNumber={4}
      title="Preprocessing"
      description="Configure the signal preprocessing pipeline. Toggle each step (filtering, ICA, normalization) ON/OFF as needed."
      prevPath="/data/validation"
      nextPath="/train"
      onNext={handleNext}
    >
      {/* AI Recommendation Card */}
      {!processComplete && (
        <div className="card-elevated p-6 border-l-4 border-l-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">AI Recommended Pipeline</h3>
                  <Badge className="bg-status-pass/10 text-status-pass border-0 text-xs">
                    Sleep Study Optimized
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Optimal pipeline based on TaskSpec and signal characteristics
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
                  applyPreset("sleep");
                  toast({ title: "Thank you for your feedback", description: "Sleep Study preset applied." });
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
              <Label className="text-sm font-medium mb-2 block">What should be configured differently?</Label>
              <textarea
                className="w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={3}
                placeholder="e.g., I prefer manual artifact removal over ICA / Please change filter band to 0.3-35Hz / I want to set epoching window to 10 seconds..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowFeedbackInput(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleFeedbackSubmit}>
                  Submit Feedback
                </Button>
              </div>
            </div>
          )}

          {/* Recommended Pipeline Highlight */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">Sleep Study Preset</span>
                <Badge variant="outline" className="text-xs">6-step pipeline</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Preprocessing pipeline optimized for sleep studies. Preserves pattern band (12-15Hz) while effectively removing artifacts.
            </p>
            <div className="flex flex-wrap gap-2">
              {presets.sleep.filter(s => s.enabled).map(step => (
                <Badge key={step.id} variant="secondary" className="text-xs">
                  {step.name}: {step.config}
                </Badge>
              ))}
            </div>
          </div>

          {/* Apply Recommendation Button */}
          <div className="flex justify-center gap-3 mb-4">
            <Button
              className="gap-2"
              onClick={() => {
                applyPreset("sleep");
                toast({
                  title: "Recommendation Applied",
                  description: "Sleep Study preset has been applied."
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
                Why this pipeline?
              </>
            )}
          </button>

          {/* Detailed Reasoning */}
          {showReasoningDetail && (
            <div className="mt-4 space-y-3">
              {preprocessRecommendationReasons.map((reason, index) => (
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

      {/* Pipeline Configuration */}
      <div className="card-elevated overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Preprocessing Pipeline</h3>
          </div>
          <Badge variant="secondary">
            {enabledSteps} / {steps.length} enabled
          </Badge>
        </div>

        <div className="divide-y">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "p-4 flex items-center gap-4 transition-colors",
                !step.enabled && "bg-muted/30"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>

              <div className="flex-1">
                <div className={cn(
                  "font-medium",
                  !step.enabled && "text-muted-foreground"
                )}>
                  {step.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {step.description}
                </div>
              </div>

              <div className="text-sm font-mono text-muted-foreground">
                {step.config}
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={!step.enabled}
                onClick={() => openConfigDialog(step)}
              >
                <Settings className="w-4 h-4" />
              </Button>

              <Switch
                checked={step.enabled}
                onCheckedChange={() => toggleStep(step.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preset Templates */}
      <div className="card-elevated p-6">
        <h3 className="font-semibold mb-4">Quick Presets</h3>
        <div className="flex gap-2 flex-wrap">
          {Object.keys(presets).map(presetName => (
            <Button
              key={presetName}
              variant={selectedPreset === presetName ? "default" : "outline"}
              size="sm"
              onClick={() => applyPreset(presetName)}
            >
              {presetName === "default" ? "Default EEG" :
               presetName === "sleep" ? "Sleep Study" :
               presetName === "epilepsy" ? "Epilepsy" : "Minimal"}
            </Button>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      {!processComplete && (
        <Button
          size="lg"
          className="w-full"
          onClick={handleProcess}
          disabled={isProcessing || enabledSteps === 0}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Data...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Apply Preprocessing
            </>
          )}
        </Button>
      )}

      {/* Results */}
      {processComplete && (
        <>
          {/* Processing Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="card-elevated p-4 text-center">
              <div className="text-3xl font-bold text-status-pass">{stats.filesProcessed}</div>
              <div className="text-sm text-muted-foreground">Files Processed</div>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-3xl font-bold">{stats.epochsCreated.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Epochs Created</div>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-3xl font-bold">{stats.artifactRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Artifact Rate</div>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-3xl font-bold">{stats.avgSNR.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg SNR (dB)</div>
            </div>
          </div>

          {/* Recipe Summary */}
          <div className="card-elevated p-4">
            <h4 className="font-semibold mb-3">PreprocessRecipe Summary</h4>
            <div className="font-mono text-sm bg-muted/30 p-4 rounded-lg space-y-1">
              {steps.filter(s => s.enabled).map(step => (
                <div key={step.id} className="flex justify-between">
                  <span className="text-muted-foreground">{step.name}:</span>
                  <span>{step.config}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Success Message */}
          <div className="flex items-center gap-2 p-4 bg-status-pass/10 rounded-lg border border-status-pass/30">
            <Check className="w-5 h-5 text-status-pass" />
            <span className="text-status-pass font-medium">
              Preprocessing complete. Ready for model training.
            </span>
          </div>

          {/* Reconfigure Button */}
          <Button variant="outline" onClick={() => setProcessComplete(false)}>
            Reconfigure Pipeline
          </Button>
        </>
      )}

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {editingStep?.name}</DialogTitle>
          </DialogHeader>
          {editingStep && (
            <div className="space-y-4 pt-4">
              {defaultStepConfigs[editingStep.id]?.map((field, idx) => (
                <div key={field.name} className="space-y-2">
                  <Label>{field.label}</Label>
                  {field.type === "number" && (
                    <Input
                      type="number"
                      value={stepConfigs[editingStep.id]?.[idx]?.value || field.value}
                      onChange={(e) => {
                        setStepConfigs(prev => ({
                          ...prev,
                          [editingStep.id]: prev[editingStep.id].map((f, i) =>
                            i === idx ? { ...f, value: e.target.value } : f
                          ),
                        }));
                      }}
                    />
                  )}
                  {field.type === "select" && field.options && (
                    <Select
                      value={stepConfigs[editingStep.id]?.[idx]?.value || field.value}
                      onValueChange={(value) => {
                        setStepConfigs(prev => ({
                          ...prev,
                          [editingStep.id]: prev[editingStep.id].map((f, i) =>
                            i === idx ? { ...f, value } : f
                          ),
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveStepConfig}>
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
