import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { StepPageLayout } from "@/components/layout/StepPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Database,
  FileText,
  Check,
  AlertTriangle,
  FolderOpen,
  HardDrive,
  Clock,
  Loader2,
  Plus,
  Minus,
  Users,
  Sparkles,
  Wand2,
  Brain,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Shield,
  Activity,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore, DataFile, CriteriaItem } from "@/store/useProjectStore";
import { ThinkingPanel } from "@/components/thinking";
import { ThinkingStep, ThinkingSession } from "@/types/thinking";

export default function DataCohortPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, setDatasetManifest, setCohortSpec, completeStep, setCurrentStep } = useProjectStore();

  // Dataset State
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [datasetPath, setDatasetPath] = useState("/data/eeg/raw_dataset");
  const [dataFiles, setDataFiles] = useState<DataFile[]>([]);

  // Cohort State
  const [cohortDefined, setCohortDefined] = useState(false);
  const [isApplyingCohort, setIsApplyingCohort] = useState(false);
  const [newCriteriaText, setNewCriteriaText] = useState("");
  const [newCriteriaType, setNewCriteriaType] = useState<"include" | "exclude">("include");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Common State
  const [activeTab, setActiveTab] = useState("dataset");
  const [isThinkingPanelOpen, setIsThinkingPanelOpen] = useState(false);
  const [showReasoningDetail, setShowReasoningDetail] = useState(false);

  // Criteria
  const [criteria, setCriteria] = useState<CriteriaItem[]>([
    { id: "1", text: "Age 18-65 years", type: "include", enabled: true },
    { id: "2", text: "PSG recording with standard montage", type: "include", enabled: true },
    { id: "3", text: "Minimum 4 hours of sleep recording", type: "include", enabled: true },
    { id: "4", text: "Severe sleep apnea (AHI > 30)", type: "exclude", enabled: true },
    { id: "5", text: "Use of sedative medications", type: "exclude", enabled: true },
    { id: "6", text: "Poor EEG quality (artifact > 30%)", type: "exclude", enabled: true },
  ]);

  // Generate mock data files
  const generateMockFiles = (): DataFile[] => {
    const files: DataFile[] = [];
    for (let i = 1; i <= 100; i++) {
      const patientNum = String(i).padStart(3, '0');
      const hours = Math.floor(Math.random() * 5) + 5;
      const minutes = Math.floor(Math.random() * 60);
      const sizeBase = hours * 5.5 + (minutes / 60) * 5.5;
      const size = (sizeBase + Math.random() * 10).toFixed(1);

      let status: "valid" | "warning" = "valid";
      let message: string | undefined;
      let channels = 19;

      if (Math.random() < 0.05) {
        status = "warning";
        channels = Math.random() < 0.5 ? 21 : 17;
        message = `Channel mismatch (${channels} vs 19)`;
      } else if (Math.random() < 0.05) {
        status = "warning";
        message = "Recording too short (< 4h)";
      }

      files.push({
        id: String(i),
        name: `patient_${patientNum}.edf`,
        size: `${size} MB`,
        duration: `${hours}h ${String(minutes).padStart(2, '0')}m`,
        channels,
        sampleRate: 256,
        status,
        message,
      });
    }
    return files;
  };

  // Thinking Steps
  const thinkingSteps: ThinkingStep[] = [
    {
      id: "step-1",
      title: "Scanning Dataset",
      status: "pending",
      reasoning: "Scanning the specified directory to identify EEG/PSG files and extract metadata.",
      evidence: [
        { id: "ev-1-1", type: "data", title: "Expected Files", detail: "Looking for EDF, EDF+, BDF format files", icon: Database },
      ],
      conclusion: "Dataset structure identified.",
      isInterventionPoint: false,
    },
    {
      id: "step-2",
      title: "Analyzing Protocol for Cohort Criteria",
      status: "pending",
      reasoning: "Based on the uploaded protocol and clinical standards, recommending inclusion/exclusion criteria.",
      evidence: [
        { id: "ev-2-1", type: "literature", title: "AASM Guidelines", detail: "Standard criteria for sleep studies", icon: BookOpen },
        { id: "ev-2-2", type: "taskspec", title: "Study Type", detail: "Sleep Spindle Detection requires healthy adult subjects", icon: FileText },
      ],
      conclusion: "6 criteria recommended based on protocol analysis.",
      confidence: 93,
      isInterventionPoint: true,
      recommendation: {
        value: "apply_all",
        alternatives: [
          { id: "strict", label: "Strict Criteria", description: "Tighter thresholds for higher quality cohort" },
          { id: "relaxed", label: "Relaxed Criteria", description: "Broader criteria for larger sample size" },
        ],
      },
    },
  ];

  const [thinkingSession, setThinkingSession] = useState<ThinkingSession>({
    id: "data-cohort-session",
    pageContext: "preprocess",
    steps: thinkingSteps,
    currentStepIndex: 0,
    status: "idle",
    interventions: [],
  });

  // Load existing data
  useEffect(() => {
    if (currentProject?.datasetManifest && currentProject.datasetManifest.files.length > 10) {
      setDatasetPath(currentProject.datasetManifest.path);
      setDataFiles(currentProject.datasetManifest.files);
      setScanComplete(true);
    } else {
      setDataFiles(generateMockFiles());
    }
    if (currentProject?.cohortSpec) {
      setCriteria(currentProject.cohortSpec.criteria);
      setCohortDefined(true);
    }
  }, []);

  // Scan Dataset
  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const freshFiles = generateMockFiles();
    setDataFiles(freshFiles);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanComplete(true);

          const totalMB = freshFiles.reduce((acc, f) => {
            const sizeNum = parseFloat(f.size.replace(/[^0-9.]/g, ""));
            return acc + sizeNum;
          }, 0);

          const manifest = {
            path: datasetPath,
            files: freshFiles,
            format: "EDF+",
            totalSize: `${(totalMB / 1024).toFixed(1)} GB`,
            avgDuration: "8h 15m",
          };

          setDatasetManifest(manifest);
          setActiveTab("cohort");
          toast({
            title: "Scan Complete",
            description: `Found ${freshFiles.length} files. Now configure cohort criteria.`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  // Apply Cohort
  const handleApplyCohort = async () => {
    setIsApplyingCohort(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const enabledInclude = criteria.filter(c => c.type === "include" && c.enabled).length;
    const enabledExclude = criteria.filter(c => c.type === "exclude" && c.enabled).length;
    const total = dataFiles.length;

    const cohortStats = {
      total,
      afterInclusion: Math.round(total * 0.88),
      afterExclusion: Math.round(total * 0.68),
      labelPositive: Math.round(total * 0.68 * 0.33),
      labelNegative: Math.round(total * 0.68 * 0.67),
    };

    setCohortSpec({ criteria, stats: cohortStats });
    completeStep(2);
    setCurrentStep(3);

    setIsApplyingCohort(false);
    setCohortDefined(true);
    toast({
      title: "Dataset & Cohort Complete",
      description: `${cohortStats.afterExclusion} subjects selected. Ready for Data Validation.`,
    });
  };

  // Run All (AI Recommended)
  const runAllSetup = async () => {
    if (!scanComplete) {
      handleScan();
      // Wait for scan to complete then apply cohort
      setTimeout(() => {
        handleApplyCohort();
      }, 1500);
    } else {
      handleApplyCohort();
    }
  };

  const handleThinkingIntervention = useCallback((action: 'approve' | 'modify' | 'reject', value?: string) => {
    if (action === "approve") {
      toast({ title: "Configuration Approved", description: "Applying recommended settings." });
      runAllSetup();
    } else if (action === "modify") {
      toast({ title: "Configuration Modified", description: `Applying ${value} mode.` });
    } else {
      toast({ title: "Rejected", description: "Please configure manually.", variant: "destructive" });
    }
    setIsThinkingPanelOpen(false);
  }, [toast, scanComplete]);

  const handleNext = () => navigate("/data/validation");

  // Criteria helpers
  const includeCriteria = criteria.filter(c => c.type === "include");
  const excludeCriteria = criteria.filter(c => c.type === "exclude");

  const toggleCriteria = (id: string) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
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
  };

  const deleteCriteria = (id: string) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
    setCohortDefined(false);
  };

  const validFiles = dataFiles.filter(f => f.status === "valid").length;
  const warningFiles = dataFiles.filter(f => f.status === "warning").length;
  const totalSizeMB = dataFiles.reduce((acc, f) => acc + parseFloat(f.size.replace(/[^0-9.]/g, "")), 0);
  const totalSizeGB = (totalSizeMB / 1024).toFixed(1);

  const cohortStats = currentProject?.cohortSpec?.stats || {
    total: dataFiles.length,
    afterInclusion: Math.round(dataFiles.length * 0.88),
    afterExclusion: Math.round(dataFiles.length * 0.68),
    labelPositive: Math.round(dataFiles.length * 0.68 * 0.33),
    labelNegative: Math.round(dataFiles.length * 0.68 * 0.67),
  };

  const allComplete = scanComplete && cohortDefined;

  const renderCriteriaItem = (item: CriteriaItem, type: "include" | "exclude") => {
    const bgClass = type === "include"
      ? (item.enabled ? "bg-status-pass/5 border-status-pass/30" : "bg-muted/30 border-transparent")
      : (item.enabled ? "bg-status-fail/5 border-status-fail/30" : "bg-muted/30 border-transparent");

    return (
      <div key={item.id} className={cn("flex items-center gap-3 p-3 rounded-lg border transition-colors group", bgClass)}>
        <Checkbox checked={item.enabled} onCheckedChange={() => toggleCriteria(item.id)} />
        <span className={cn("text-sm flex-1", !item.enabled && "text-muted-foreground")}>{item.text}</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteCriteria(item.id)}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <StepPageLayout
      stepNumber={2}
      title="Dataset / Cohort"
      description="Scan your data folder and define cohort criteria. AI automatically detects file formats and recommends inclusion/exclusion criteria based on your protocol."
      prevPath="/setup/protocol"
      nextPath="/data/validation"
      onNext={handleNext}
    >
      {/* AI Quick Action */}
      {!allComplete && (
        <div className="card-elevated p-6 border-l-4 border-l-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">AI Recommended Setup</h3>
                <p className="text-sm text-muted-foreground">
                  Scan data and apply protocol-based cohort criteria automatically
                </p>
              </div>
            </div>
            <Badge className="bg-status-pass/10 text-status-pass border-0">93% Confidence</Badge>
          </div>

          <div className="flex justify-center gap-3">
            <Button className="gap-2" onClick={runAllSetup} disabled={isScanning || isApplyingCohort}>
              {(isScanning || isApplyingCohort) ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
              ) : (
                <><Wand2 className="w-4 h-4" />Run All Setup</>
              )}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setIsThinkingPanelOpen(true)}>
              <Brain className="w-4 h-4" />View AI Thinking
            </Button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="card-elevated">
        <div className="border-b px-4">
          <TabsList className="h-12 bg-transparent">
            <TabsTrigger value="dataset" className="gap-2">
              <Database className="w-4 h-4" />
              Dataset Scan
              {scanComplete && <Check className="w-3 h-3 text-status-pass ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="cohort" className="gap-2">
              <Users className="w-4 h-4" />
              Cohort Criteria
              {cohortDefined && <Check className="w-3 h-3 text-status-pass ml-1" />}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Dataset Tab */}
        <TabsContent value="dataset" className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                value={datasetPath}
                onChange={(e) => { setDatasetPath(e.target.value); setScanComplete(false); }}
                className="w-full px-4 py-3 border rounded-lg bg-muted/30 font-mono text-sm"
                placeholder="Enter path to EEG/PSG data folder..."
              />
            </div>
            <Button variant="outline" className="gap-2"><FolderOpen className="w-4 h-4" />Browse</Button>
            <Button className="gap-2" onClick={handleScan} disabled={isScanning || !datasetPath}>
              {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {isScanning ? "Scanning..." : "Scan"}
            </Button>
          </div>

          {isScanning && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Scanning files...</span><span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>
          )}

          {scanComplete && (
            <>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{dataFiles.length}</div>
                  <div className="text-xs text-muted-foreground">Total Files</div>
                </div>
                <div className="text-center p-3 bg-status-pass/10 rounded-lg">
                  <div className="text-2xl font-bold text-status-pass">{validFiles}</div>
                  <div className="text-xs text-muted-foreground">Valid</div>
                </div>
                <div className="text-center p-3 bg-status-warn/10 rounded-lg">
                  <div className="text-2xl font-bold text-status-warn">{warningFiles}</div>
                  <div className="text-xs text-muted-foreground">Warnings</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{totalSizeGB} GB</div>
                  <div className="text-xs text-muted-foreground">Total Size</div>
                </div>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg mb-4">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Format:</span> <span className="font-medium">EDF+</span></div>
                  <div><span className="text-muted-foreground">Channels:</span> <span className="font-medium">19 (10-20)</span></div>
                  <div><span className="text-muted-foreground">Sample Rate:</span> <span className="font-medium">256 Hz</span></div>
                  <div><span className="text-muted-foreground">Avg Duration:</span> <span className="font-medium">8h 15m</span></div>
                </div>
              </div>

              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {dataFiles.slice(0, 20).map(file => (
                  <div key={file.id} className={cn("p-2 flex items-center gap-3 text-sm border-b last:border-0", file.status === "warning" && "bg-status-warn/5")}>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium flex-1 truncate">{file.name}</span>
                    <span className="text-muted-foreground text-xs">{file.size}</span>
                    <span className="text-muted-foreground text-xs">{file.duration}</span>
                    {file.status === "valid" ? <Check className="w-4 h-4 text-status-pass" /> : <AlertTriangle className="w-4 h-4 text-status-warn" />}
                  </div>
                ))}
                {dataFiles.length > 20 && (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    ... and {dataFiles.length - 20} more files
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* Cohort Tab */}
        <TabsContent value="cohort" className="p-6">
          {!scanComplete && (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Scan dataset first to configure cohort</p>
            </div>
          )}

          {scanComplete && (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Inclusion Criteria */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-status-pass/20 flex items-center justify-center">
                      <Plus className="w-3 h-3 text-status-pass" />
                    </div>
                    <h4 className="font-medium">Inclusion Criteria</h4>
                    <Badge variant="secondary" className="ml-auto">{includeCriteria.filter(c => c.enabled).length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {includeCriteria.map(item => renderCriteriaItem(item, "include"))}
                    <Dialog open={isAddDialogOpen && newCriteriaType === "include"} onOpenChange={(open) => { setIsAddDialogOpen(open); if (open) setNewCriteriaType("include"); }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full text-primary">
                          <Plus className="w-4 h-4 mr-1" />Add Criterion
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add Inclusion Criterion</DialogTitle></DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Input placeholder="Enter criterion..." value={newCriteriaText} onChange={(e) => setNewCriteriaText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addCriteria(); }} />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button onClick={addCriteria} disabled={!newCriteriaText.trim()}>Add</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Exclusion Criteria */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-status-fail/20 flex items-center justify-center">
                      <Minus className="w-3 h-3 text-status-fail" />
                    </div>
                    <h4 className="font-medium">Exclusion Criteria</h4>
                    <Badge variant="secondary" className="ml-auto">{excludeCriteria.filter(c => c.enabled).length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {excludeCriteria.map(item => renderCriteriaItem(item, "exclude"))}
                    <Dialog open={isAddDialogOpen && newCriteriaType === "exclude"} onOpenChange={(open) => { setIsAddDialogOpen(open); if (open) setNewCriteriaType("exclude"); }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full text-primary">
                          <Plus className="w-4 h-4 mr-1" />Add Criterion
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add Exclusion Criterion</DialogTitle></DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Input placeholder="Enter criterion..." value={newCriteriaText} onChange={(e) => setNewCriteriaText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addCriteria(); }} />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button onClick={addCriteria} disabled={!newCriteriaText.trim()}>Add</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              {!cohortDefined && (
                <Button className="w-full" onClick={handleApplyCohort} disabled={isApplyingCohort}>
                  {isApplyingCohort ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Applying...</> : "Apply Cohort Criteria"}
                </Button>
              )}

              {cohortDefined && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-primary">Final Cohort: {cohortStats.afterExclusion} subjects</div>
                      <div className="text-sm text-muted-foreground">
                        {cohortStats.total} total → {cohortStats.afterInclusion} after inclusion → {cohortStats.afterExclusion} after exclusion
                      </div>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-0">
                      {((cohortStats.afterExclusion / cohortStats.total) * 100).toFixed(0)}% Selected
                    </Badge>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Overall Status */}
      {allComplete && (
        <div className="flex items-center gap-2 p-4 bg-status-pass/10 rounded-lg border border-status-pass/30">
          <Check className="w-5 h-5 text-status-pass" />
          <span className="text-status-pass font-medium">
            Dataset & Cohort setup complete. {cohortStats.afterExclusion} subjects selected. Proceed to Data Validation.
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
