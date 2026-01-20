import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StepPageLayout } from "@/components/layout/StepPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Check,
  Loader2,
  X,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Target,
  Brain,
  Database,
  Wand2,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore } from "@/store/useProjectStore";
import { ThinkingPanel } from "@/components/thinking";
import { ThinkingStep, ThinkingSession } from "@/types/thinking";

export default function ProtocolPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, setTaskSpec, completeStep, setCurrentStep, updateProjectName } = useProjectStore();

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showReasoningDetail, setShowReasoningDetail] = useState(false);
  const [userFeedback, setUserFeedback] = useState<"agree" | "disagree" | null>(null);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isThinkingPanelOpen, setIsThinkingPanelOpen] = useState(false);

  // Thinking panel steps for protocol extraction
  const thinkingSteps: ThinkingStep[] = [
    {
      id: "step-1",
      title: "Parsing Document Structure",
      status: "pending",
      reasoning: "Analyzing the document structure to identify key sections: Abstract, Introduction, Methods, and Objectives. Looking for research hypothesis and target outcomes.",
      evidence: [
        {
          id: "ev-1-1",
          type: "taskspec",
          title: "Document Format",
          detail: "Research protocol in standard format with clear sections",
          icon: FileText,
        },
      ],
      conclusion: "Document structure identified. Key sections located for analysis.",
      isInterventionPoint: false,
    },
    {
      id: "step-2",
      title: "Extracting Research Objectives",
      status: "pending",
      reasoning: "Scanning document for keywords related to research goals. Found 'sleep spindle', 'detection', 'N2 sleep', 'memory consolidation' - indicating a pattern detection task in sleep research.",
      evidence: [
        {
          id: "ev-2-1",
          type: "taskspec",
          title: "Keyword Analysis",
          detail: "Primary keywords: sleep spindle, detection, N2 sleep",
          icon: Target,
        },
        {
          id: "ev-2-2",
          type: "literature",
          title: "Task Classification",
          detail: "Keywords map to 'Pattern Detection' task type",
          icon: BookOpen,
        },
      ],
      conclusion: "Research objective: Sleep Spindle Detection in Stage N2 Sleep.",
      isInterventionPoint: false,
    },
    {
      id: "step-3",
      title: "Identifying Data Requirements",
      status: "pending",
      reasoning: "Analyzing methodology section for data specifications. Found references to 'EEG', 'PSG', 'polysomnography', '19-channel', '256Hz sampling rate'.",
      evidence: [
        {
          id: "ev-3-1",
          type: "data",
          title: "Data Type",
          detail: "EEG/PSG polysomnography recordings required",
          icon: Database,
        },
        {
          id: "ev-3-2",
          type: "data",
          title: "Technical Specs",
          detail: "19 channels, 256Hz sampling rate",
          icon: Database,
        },
      ],
      conclusion: "Data requirements: Multi-channel EEG/PSG recordings.",
      isInterventionPoint: false,
    },
    {
      id: "step-4",
      title: "Generating TaskSpec",
      status: "pending",
      reasoning: "Synthesizing extracted information into a structured TaskSpec. Confidence level based on keyword match strength and document clarity.",
      evidence: [],
      conclusion: "TaskSpec generated with 95% confidence based on clear protocol structure.",
      confidence: 95,
      isInterventionPoint: true,
      recommendation: {
        value: "pattern_detection",
        alternatives: [
          { id: "classification", label: "Classification", description: "Categorize epochs into discrete classes" },
          { id: "regression", label: "Regression", description: "Predict continuous values from signals" },
        ],
      },
    },
  ];

  // Thinking session state
  const [thinkingSession, setThinkingSession] = useState<ThinkingSession>({
    id: "protocol-session",
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
        id: "protocol-session",
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
        title: "Extraction Approved",
        description: "TaskSpec has been confirmed.",
      });
    } else if (action === "modify" && value) {
      toast({
        title: "Task Type Modified",
        description: `Task type changed to ${value}.`,
      });
    } else if (action === "reject") {
      toast({
        title: "Extraction Rejected",
        description: "Please review and modify the extracted information.",
        variant: "destructive",
      });
    }
    setIsThinkingPanelOpen(false);
  }, [toast]);

  // Load existing data from store
  useEffect(() => {
    if (currentProject?.taskSpec) {
      setAnalysisComplete(true);
      if (currentProject.taskSpec.fileName) {
        // Create a mock file object for display
        setFile({ name: currentProject.taskSpec.fileName, size: currentProject.taskSpec.fileSize || 0 } as File);
      }
    }
  }, [currentProject]);

  const handleFileUpload = (selectedFile: File) => {
    if (selectedFile) {
      setFile(selectedFile);
      setIsUploading(true);
      setAnalysisComplete(false);

      // Simulate upload
      setTimeout(() => {
        setIsUploading(false);
        toast({
          title: "File Uploaded",
          description: "Research protocol uploaded successfully.",
        });
      }, 1000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.docx') || droppedFile.name.endsWith('.pdf'))) {
      handleFileUpload(droppedFile);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a DOCX or PDF file.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract task spec and save to store
    const taskSpec = {
      title: "Sleep Spindle Detection in Stage N2 Sleep",
      purpose: "Detect sleep spindles and correlate with memory consolidation",
      taskType: "Pattern Detection",
      inputData: "EEG/PSG",
      subjects: 142,
      fileName: file?.name,
      fileSize: file?.size,
    };

    setTaskSpec(taskSpec);
    updateProjectName(taskSpec.title);
    completeStep(1);
    setCurrentStep(2);

    setIsAnalyzing(false);
    setAnalysisComplete(true);
    toast({
      title: "Analysis Complete",
      description: "TaskSpec has been extracted from the protocol.",
    });
  };

  const handleNext = () => {
    navigate("/setup/dataset");
  };

  const handleClearFile = () => {
    setFile(null);
    setAnalysisComplete(false);
  };

  // Use stored data or mock data
  const extractedData = currentProject?.taskSpec || {
    title: "Sleep Spindle Detection in Stage N2 Sleep",
    purpose: "Detect sleep spindles and correlate with memory consolidation",
    taskType: "Pattern Detection",
    inputData: "EEG/PSG",
    subjects: 142,
  };

  // AI extraction reasoning
  const extractionReasons = [
    {
      factor: "Research Goal Analysis",
      detail: "Identified keywords 'sleep spindle', 'detection', 'N2 sleep' in document. This corresponds to Pattern Detection task type.",
      icon: Target,
    },
    {
      factor: "Data Type Identification",
      detail: "Found 'EEG', 'PSG', 'polysomnography' terms in methodology section. 19-channel EEG data is required.",
      icon: Database,
    },
    {
      factor: "Analysis Direction Inference",
      detail: "Target patterns are 0.5-2 second events in 12-15Hz frequency band. Time-series pattern recognition model is suitable.",
      icon: Brain,
    },
  ];

  return (
    <StepPageLayout
      stepNumber={1}
      title="Research Protocol"
      description="Upload your research protocol. AI will automatically extract research objectives, analysis type, and target data."
      prevPath="/"
      nextPath="/setup/data"
      onNext={handleNext}
    >
      {/* Upload Area */}
      <div className="card-elevated p-8">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-12 text-center transition-all",
            file
              ? "border-status-pass bg-status-pass/5"
              : isDragOver
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 hover:bg-primary/5"
          )}
        >
          {file ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-status-pass/20 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-status-pass" />
              </div>
              <div>
                <p className="font-semibold text-lg">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFile}
                className="gap-1"
              >
                <X className="w-4 h-4" />
                Change File
              </Button>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <p className="text-lg font-medium mb-2">
                Drag and drop your protocol file
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports DOCX, PDF files up to 200MB
              </p>
              <input
                type="file"
                accept=".docx,.pdf"
                onChange={handleInputChange}
                className="hidden"
              />
              <Button variant="outline">
                Browse Files
              </Button>
            </label>
          )}
        </div>
      </div>

      {/* Analyze Button */}
      {file && !analysisComplete && (
        <Button
          size="lg"
          className="w-full"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Protocol...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Analyze Protocol
            </>
          )}
        </Button>
      )}

      {/* Extracted Information */}
      {analysisComplete && (
        <div className="card-elevated p-6 space-y-4 border-l-4 border-l-primary">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-pass/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-status-pass" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">AI Extracted TaskSpec</span>
                  <Badge className="bg-status-pass/10 text-status-pass border-0 text-xs">
                    95% Confidence
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Information automatically extracted from research protocol
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
                  toast({ title: "Thank you for your feedback", description: "Extracted information is accurate." });
                }}
              >
                <ThumbsUp className="w-3 h-3" />
                Accurate
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
                Needs Correction
              </Button>
            </div>
          </div>

          {/* Feedback Input */}
          {showFeedbackInput && (
            <div className="p-4 bg-status-warn/5 rounded-lg border border-status-warn/20">
              <label className="text-sm font-medium mb-2 block">What was extracted incorrectly?</label>
              <textarea
                className="w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                rows={3}
                placeholder="e.g., Task Type should be Classification not Pattern Detection / The research title is incorrect..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowFeedbackInput(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => {
                  if (feedbackText.trim()) {
                    toast({ title: "Feedback Submitted", description: "You can modify the extraction results." });
                    setShowFeedbackInput(false);
                  }
                }}>
                  Submit Feedback
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Research Title</div>
              <div className="font-medium">{extractedData.title}</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Task Type</div>
              <div className="font-medium">
                <Badge>{extractedData.taskType}</Badge>
              </div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Input Data</div>
              <div className="font-medium">{extractedData.inputData}</div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Expected Subjects</div>
              <div className="font-medium">{extractedData.subjects}</div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Purpose</div>
            <div className="text-sm">{extractedData.purpose}</div>
          </div>

          {/* View AI Thinking Button */}
          <div className="flex justify-center gap-3 mb-4">
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
                Hide Extraction Reasoning
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                How did AI extract this?
              </>
            )}
          </button>

          {/* Detailed Reasoning */}
          {showReasoningDetail && (
            <div className="space-y-3">
              {extractionReasons.map((reason, index) => (
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
