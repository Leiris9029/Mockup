import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StepPageLayout } from "@/components/layout/StepPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Cpu,
  Check,
  Play,
  Pause,
  Square,
  TrendingUp,
  Clock,
  DollarSign,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Database,
  Layers,
  Zap,
  FileText,
  Wand2,
  Brain,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore, TrainingMetrics } from "@/store/useProjectStore";
import { TrainingChart } from "@/components/charts/TrainingChart";
import { ThinkingPanel } from "@/components/thinking";
import { ThinkingSession, ThinkingStep } from "@/types/thinking";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  recommended: boolean;
  strengths: string[];
  weaknesses: string[];
}

interface RecommendationReason {
  factor: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function TrainingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, setTrainingResult, completeStep, setCurrentStep } = useProjectStore();

  const [selectedModel, setSelectedModel] = useState("cnn-lstm");
  const [isTraining, setIsTraining] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [metrics, setMetrics] = useState({ loss: 0, accuracy: 0, valLoss: 0, valAccuracy: 0 });
  const [trainingHistory, setTrainingHistory] = useState<TrainingMetrics[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showReasoningDetail, setShowReasoningDetail] = useState(false);
  const [userFeedback, setUserFeedback] = useState<"agree" | "disagree" | null>(null);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isThinkingPanelOpen, setIsThinkingPanelOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Model options - defined early for use in callbacks
  const modelOptions: ModelOption[] = [
    {
      id: "cnn-lstm",
      name: "CNN-LSTM Hybrid",
      description: "Best for temporal patterns with local and sequential feature extraction",
      recommended: true,
      strengths: ["Captures local + temporal patterns in EEG time series", "SOTA performance for sleep pattern detection", "Interpretable feature extraction"],
      weaknesses: ["Relatively longer training time", "Requires hyperparameter tuning"],
    },
    {
      id: "transformer",
      name: "EEG Transformer",
      description: "Self-attention based long-range dependency modeling",
      recommended: false,
      strengths: ["Captures long-range temporal dependencies", "Fast training with parallelization", "Learns multi-channel relationships"],
      weaknesses: ["Overfitting risk with small datasets", "High computational cost"],
    },
    {
      id: "resnet",
      name: "ResNet-1D",
      description: "Deep residual network with skip connections",
      recommended: false,
      strengths: ["Stable training", "Easy transfer learning", "Proven architecture"],
      weaknesses: ["Limited temporal context capture", "Not time-series specialized"],
    },
    {
      id: "rf",
      name: "Random Forest",
      description: "Feature engineering-based ensemble model",
      recommended: false,
      strengths: ["Fast training", "Easy interpretation", "Robust against overfitting"],
      weaknesses: ["Requires manual feature extraction", "Limited complex pattern learning"],
    },
  ];

  // Thinking panel steps for model selection
  const thinkingSteps: ThinkingStep[] = [
    {
      id: "step-1",
      title: "Analyzing Task Specification",
      status: "pending",
      reasoning: "Reading the uploaded protocol document to understand the research objective. The task is Sleep Spindle Detection, which requires identifying transient 12-15Hz oscillations in EEG signals lasting 0.5-2 seconds.",
      evidence: [
        {
          id: "ev-1-1",
          type: "taskspec",
          title: "Protocol Document",
          detail: "Target: Sleep spindle detection in C3/C4 channels",
          icon: FileText,
        },
        {
          id: "ev-1-2",
          type: "taskspec",
          title: "Signal Characteristics",
          detail: "12-15Hz oscillations, 0.5-2s duration",
          icon: Layers,
        },
      ],
      conclusion: "Task requires temporal pattern recognition with precise frequency band focus.",
      isInterventionPoint: false,
    },
    {
      id: "step-2",
      title: "Evaluating Data Characteristics",
      status: "pending",
      reasoning: "Analyzing the dataset manifest to assess data volume and quality. Checking subject count, recording duration, and channel configuration to determine appropriate model complexity.",
      evidence: [
        {
          id: "ev-2-1",
          type: "data",
          title: "Dataset Size",
          detail: `${currentProject?.datasetManifest?.files?.length || 142} subjects with overnight recordings`,
          icon: Database,
        },
        {
          id: "ev-2-2",
          type: "qc_result",
          title: "Data Quality",
          detail: "89% of recordings passed QC thresholds",
          icon: Check,
        },
      ],
      conclusion: "Sufficient data volume (142+ subjects) supports deep learning approaches.",
      isInterventionPoint: false,
    },
    {
      id: "step-3",
      title: "Comparing Model Architectures",
      status: "pending",
      reasoning: "Evaluating candidate architectures based on task requirements. CNN excels at local pattern extraction (spindle morphology), while LSTM captures temporal dependencies (spindle sequences and context).",
      evidence: [
        {
          id: "ev-3-1",
          type: "literature",
          title: "CNN Strengths",
          detail: "Extracts local spatial/frequency features from EEG windows",
          icon: Layers,
        },
        {
          id: "ev-3-2",
          type: "literature",
          title: "LSTM Strengths",
          detail: "Models sequential dependencies in time series data",
          icon: TrendingUp,
        },
      ],
      conclusion: "Hybrid CNN-LSTM architecture can leverage both local and temporal features.",
      isInterventionPoint: false,
    },
    {
      id: "step-4",
      title: "Reviewing Literature Evidence",
      status: "pending",
      reasoning: "Searching recent publications for benchmark results on sleep spindle detection. Identifying state-of-the-art methods and their reported performance metrics.",
      evidence: [
        {
          id: "ev-4-1",
          type: "literature",
          title: "Chambon et al. 2018",
          detail: "CNN-LSTM achieved AUROC 0.87 on MASS dataset",
          icon: BookOpen,
        },
        {
          id: "ev-4-2",
          type: "literature",
          title: "Perslev et al. 2021",
          detail: "U-Time (CNN-based) showed robust cross-dataset generalization",
          icon: BookOpen,
        },
      ],
      conclusion: "CNN-LSTM architectures consistently achieve top performance (AUROC 0.85+).",
      isInterventionPoint: false,
    },
    {
      id: "step-5",
      title: "Final Recommendation",
      status: "pending",
      reasoning: "Synthesizing analysis results to make a final recommendation. Considering task requirements, data characteristics, and literature evidence to select the optimal model architecture.",
      evidence: [],
      conclusion: "CNN-LSTM Hybrid is recommended with 92% confidence based on task-data-literature alignment.",
      confidence: 92,
      isInterventionPoint: true,
      recommendation: {
        value: "cnn-lstm",
        alternatives: [
          { id: "transformer", label: "EEG Transformer", description: "Better for very large datasets with long-range dependencies" },
          { id: "resnet", label: "ResNet-1D", description: "Simpler architecture, good for transfer learning" },
          { id: "rf", label: "Random Forest", description: "Fast baseline with interpretable features" },
        ],
      },
    },
  ];

  // Thinking session state
  const [thinkingSession, setThinkingSession] = useState<ThinkingSession>({
    id: "training-session",
    pageContext: "training",
    steps: thinkingSteps,
    currentStepIndex: 0,
    status: "idle",
    interventions: [],
  });

  // Reset thinking session when panel opens
  useEffect(() => {
    if (isThinkingPanelOpen) {
      setThinkingSession({
        id: "training-session",
        pageContext: "training",
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
        title: "Recommendation Approved",
        description: "CNN-LSTM model has been selected.",
      });
      setSelectedModel("cnn-lstm");
    } else if (action === "modify" && value) {
      const modelName = modelOptions.find(m => m.id === value)?.name || value;
      toast({
        title: "Selection Modified",
        description: `${modelName} has been selected instead.`,
      });
      setSelectedModel(value);
    } else if (action === "reject") {
      toast({
        title: "Recommendation Rejected",
        description: "Please select a model manually below.",
        variant: "destructive",
      });
    }
    setIsThinkingPanelOpen(false);
  }, [toast, modelOptions]);

  // AI recommendation reasons (generated based on TaskSpec, DatasetManifest)
  const recommendationReasons: RecommendationReason[] = [
    {
      factor: "Task Type",
      detail: "Sleep Spindle Detection requires temporal pattern recognition. CNN-LSTM simultaneously learns local shape (CNN) and temporal context (LSTM).",
      icon: FileText,
    },
    {
      factor: "Data Characteristics",
      detail: `${currentProject?.datasetManifest?.files?.length || 100} patient records, average 8-hour recordings. Sufficient data for deep learning model training.`,
      icon: Database,
    },
    {
      factor: "Signal Properties",
      detail: "19-channel EEG, 256Hz sampling. Target patterns are 0.5-2 second events in 12-15Hz band, optimally suited for CNN-LSTM.",
      icon: Layers,
    },
    {
      factor: "Literature Evidence",
      detail: "Recent studies show CNN-LSTM achieves AUROC 0.85+ for sleep pattern detection. Transformer is advantageous only for large-scale datasets.",
      icon: Zap,
    },
  ];

  // Load existing data from store
  useEffect(() => {
    if (currentProject?.trainingResult) {
      setTrainingHistory(currentProject.trainingResult.history);
      setTrainingComplete(true);
      setSelectedModel(currentProject.trainingResult.model);
    }
  }, [currentProject]);

  const startTraining = () => {
    setIsTraining(true);
    setIsPaused(false);
    setProgress(0);
    setEpoch(0);
    setTrainingHistory([]);
    setElapsedTime(0);
  };

  const pauseTraining = () => {
    setIsPaused(true);
  };

  const resumeTraining = () => {
    setIsPaused(false);
  };

  const stopTraining = () => {
    setIsTraining(false);
    setIsPaused(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
  };

  useEffect(() => {
    if (!isTraining || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
      return;
    }

    // Time counter
    timeIntervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(intervalRef.current!);
          clearInterval(timeIntervalRef.current!);
          setIsTraining(false);
          setTrainingComplete(true);

          // Save to store
          const finalHistory = [...trainingHistory];
          const trainingResult = {
            model: selectedModel,
            epochs: 50,
            history: finalHistory,
            bestAUROC: 0.847,
            bestAUPRC: 0.792,
            totalTime: formatTime(elapsedTime),
            totalCost: "$0.47",
          };

          setTrainingResult(trainingResult);
          completeStep(7);
          setCurrentStep(8);

          toast({
            title: "Training Complete",
            description: "Model has been trained successfully.",
          });
          return 100;
        }
        return newProgress;
      });

      setEpoch(prev => {
        const newEpoch = Math.min(prev + 1, 50);

        // Calculate metrics with some noise for realism
        const baseLoss = Math.max(0.1, 0.8 - (newEpoch / 50) * 0.7);
        const baseAccuracy = Math.min(0.95, 0.5 + (newEpoch / 50) * 0.45);
        const noise = () => (Math.random() - 0.5) * 0.02;

        const newMetrics = {
          epoch: newEpoch,
          loss: baseLoss + noise(),
          accuracy: baseAccuracy + noise(),
          valLoss: baseLoss + 0.05 + noise(),
          valAccuracy: baseAccuracy - 0.03 + noise(),
        };

        setMetrics(newMetrics);
        setTrainingHistory(prev => [...prev, newMetrics]);

        return newEpoch;
      });
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
    };
  }, [isTraining, isPaused, selectedModel, elapsedTime, trainingHistory, toast, setTrainingResult, completeStep, setCurrentStep]);

  const handleNext = () => {
    navigate("/evaluate");
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Use stored data or defaults
  const storedResult = currentProject?.trainingResult;
  const displayHistory = trainingComplete ? (storedResult?.history || trainingHistory) : trainingHistory;

  return (
    <StepPageLayout
      stepNumber={5}
      title="Model Training"
      description="Select model architecture and start training. Monitor Loss and Accuracy in real-time."
      prevPath="/data/preprocess"
      nextPath="/evaluate"
      onNext={handleNext}
    >
      {/* AI Recommendation Card */}
      {!isTraining && !trainingComplete && (
        <div className="card-elevated p-6 border-l-4 border-l-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">AI Recommended Model</h3>
                  <Badge className="bg-status-pass/10 text-status-pass border-0 text-xs">
                    92% Confidence
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on TaskSpec and data characteristics analysis
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
                  toast({ title: "Thank you for your feedback", description: "The recommendation was helpful!" });
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
              <label className="text-sm font-medium mb-2 block">Why do you think a different model is more suitable?</label>
              <textarea
                className="w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={3}
                placeholder="e.g., I have enough data so Transformer might be more suitable / I want to start with Random Forest for quick experimentation..."
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

          {/* Recommended Model Highlight */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary">CNN-LSTM</span>
                <Badge variant="outline" className="text-xs">Hybrid Model</Badge>
              </div>
              <span className="text-sm text-muted-foreground">Expected AUROC: 0.85+</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Optimized for temporal pattern learning, capturing both local shape and temporal context of target patterns.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-status-pass font-medium">Strengths:</span>
                <ul className="mt-1 space-y-0.5 text-muted-foreground">
                  {modelOptions[0].strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <Check className="w-3 h-3 text-status-pass mt-0.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-status-warn font-medium">Considerations:</span>
                <ul className="mt-1 space-y-0.5 text-muted-foreground">
                  {modelOptions[0].weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-status-warn">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Apply Recommendation Button */}
          <div className="flex justify-center gap-3 mb-4">
            <Button
              className="gap-2"
              onClick={() => {
                setSelectedModel("cnn-lstm");
                toast({
                  title: "Recommendation Applied",
                  description: "CNN-LSTM model has been selected."
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
                Why this model?
              </>
            )}
          </button>

          {/* Detailed Reasoning */}
          {showReasoningDetail && (
            <div className="mt-4 space-y-3">
              {recommendationReasons.map((reason, index) => (
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

      {/* Model Selection */}
      {!isTraining && !trainingComplete && (
        <div className="card-elevated p-6">
          <h3 className="font-semibold mb-4">Select Model Architecture</h3>

          <div className="grid grid-cols-2 gap-3">
            {modelOptions.map(model => (
              <label
                key={model.id}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                  selectedModel === model.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                  model.recommended && selectedModel !== model.id && "border-primary/30"
                )}
              >
                <input
                  type="radio"
                  name="model"
                  value={model.id}
                  checked={selectedModel === model.id}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    {model.recommended && (
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">
                        AI Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {model.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Training Controls */}
      {!trainingComplete && (
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                isTraining ? "bg-primary/10" : "bg-muted"
              )}>
                <Cpu className={cn(
                  "w-6 h-6",
                  isTraining && !isPaused ? "text-primary animate-pulse" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <h3 className="font-semibold">
                  {isTraining ? (isPaused ? "Training Paused" : "Training in Progress...") : "Ready to Train"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isTraining ? `Epoch ${epoch} / 50` : "Click Start to begin training"}
                </p>
              </div>
            </div>

            {isTraining ? (
              <div className="flex gap-2">
                {isPaused ? (
                  <Button variant="outline" size="sm" onClick={resumeTraining}>
                    <Play className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={pauseTraining}>
                    <Pause className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={stopTraining}>
                  <Square className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={startTraining}>
                <Play className="w-4 h-4 mr-2" />
                Start Training
              </Button>
            )}
          </div>

          {isTraining && (
            <>
              <Progress value={progress} className="h-2 mb-4" />

              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground">Loss</div>
                  <div className="font-mono font-semibold">{metrics.loss.toFixed(3)}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                  <div className="font-mono font-semibold">{(metrics.accuracy * 100).toFixed(1)}%</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground">Val Loss</div>
                  <div className="font-mono font-semibold">{metrics.valLoss.toFixed(3)}</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground">Val Accuracy</div>
                  <div className="font-mono font-semibold">{(metrics.valAccuracy * 100).toFixed(1)}%</div>
                </div>
              </div>

              {/* Real-time Training Chart */}
              {trainingHistory.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Loss</h4>
                    <TrainingChart data={trainingHistory} type="loss" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Accuracy</h4>
                    <TrainingChart data={trainingHistory} type="accuracy" />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(elapsedTime)} elapsed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>~{formatTime(Math.max(0, Math.floor((100 - progress) / 2 * 0.2 * 60)))} remaining</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Est. cost: ${(progress * 0.0047).toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Training Results */}
      {trainingComplete && (
        <>
          <div className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-status-pass/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-status-pass" />
              </div>
              <div>
                <h3 className="font-semibold">Training Complete</h3>
                <p className="text-sm text-muted-foreground">
                  {modelOptions.find(m => m.id === selectedModel)?.name || "CNN-LSTM"} model trained for 50 epochs
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="card-elevated p-4 text-center">
                <div className="text-3xl font-bold text-primary">
                  {storedResult?.bestAUROC.toFixed(3) || "0.847"}
                </div>
                <div className="text-sm text-muted-foreground">Best AUROC</div>
              </div>
              <div className="card-elevated p-4 text-center">
                <div className="text-3xl font-bold">
                  {storedResult?.bestAUPRC.toFixed(3) || "0.792"}
                </div>
                <div className="text-sm text-muted-foreground">Best AUPRC</div>
              </div>
              <div className="card-elevated p-4 text-center">
                <div className="text-3xl font-bold">
                  {storedResult?.totalTime || formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
              <div className="card-elevated p-4 text-center">
                <div className="text-3xl font-bold text-status-pass">
                  {storedResult?.totalCost || "$0.47"}
                </div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
              </div>
            </div>
          </div>

          {/* Training Curves with Recharts */}
          <div className="card-elevated p-6">
            <h4 className="font-semibold mb-4">Training Curves</h4>
            {displayHistory.length > 0 ? (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium mb-2 text-muted-foreground">Loss</h5>
                  <TrainingChart data={displayHistory} type="loss" />
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2 text-muted-foreground">Accuracy</h5>
                  <TrainingChart data={displayHistory} type="accuracy" />
                </div>
              </div>
            ) : (
              <div className="aspect-[2/1] bg-muted/30 rounded-lg flex items-center justify-center border border-dashed">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                  <p>Loss & Accuracy Curves</p>
                </div>
              </div>
            )}
          </div>

          {/* Success Message */}
          <div className="flex items-center gap-2 p-4 bg-status-pass/10 rounded-lg border border-status-pass/30">
            <Check className="w-5 h-5 text-status-pass" />
            <span className="text-status-pass font-medium">
              Model saved. Proceed to evaluation.
            </span>
          </div>

          {/* Retrain Button */}
          <Button
            variant="outline"
            onClick={() => {
              setTrainingComplete(false);
              setTrainingHistory([]);
              setElapsedTime(0);
              setProgress(0);
              setEpoch(0);
            }}
          >
            Retrain Model
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
