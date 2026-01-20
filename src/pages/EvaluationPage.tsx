import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StepPageLayout } from "@/components/layout/StepPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Check,
  AlertTriangle,
  Play,
  Loader2,
  TrendingUp,
  Users,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore, SubgroupResult } from "@/store/useProjectStore";
import { CalibrationChart, generateCalibrationData } from "@/components/charts/CalibrationChart";

export default function EvaluationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, setEvaluationResult, completeStep, setCurrentStep } = useProjectStore();

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationComplete, setEvaluationComplete] = useState(false);

  // Load existing data from store
  useEffect(() => {
    if (currentProject?.evaluationResult) {
      setEvaluationComplete(true);
    }
  }, [currentProject]);

  const handleEvaluate = async () => {
    setIsEvaluating(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock evaluation results
    const evaluationResult = {
      metrics: {
        auroc: { value: 0.847, ci: [0.82, 0.87] as [number, number] },
        auprc: { value: 0.792, ci: [0.76, 0.82] as [number, number] },
        f1: 0.81,
        sensitivity: 0.84,
        specificity: 0.79,
        ece: 0.031,
        brier: 0.142,
      },
      subgroups: [
        { name: "Age < 40", auroc: 0.86, n: 45, status: "pass" as const },
        { name: "Age 40-60", auroc: 0.85, n: 52, status: "pass" as const },
        { name: "Age > 60", auroc: 0.80, n: 45, status: "warn" as const },
        { name: "Male", auroc: 0.84, n: 78, status: "pass" as const },
        { name: "Female", auroc: 0.85, n: 64, status: "pass" as const },
      ],
      externalValidation: {
        dataset: "MASS Database",
        n: 62,
        auroc: 0.83,
        status: "pass" as const,
      },
      calibrationData: generateCalibrationData(),
    };

    // Save to store
    setEvaluationResult(evaluationResult);
    completeStep(8);
    setCurrentStep(9);

    setIsEvaluating(false);
    setEvaluationComplete(true);
    toast({
      title: "Evaluation Complete",
      description: "MetricsBundle has been generated.",
    });
  };

  const handleNext = () => {
    navigate("/explain");
  };

  // Use stored data or defaults
  const storedResult = currentProject?.evaluationResult;
  const metrics = storedResult?.metrics || {
    auroc: { value: 0.847, ci: [0.82, 0.87] },
    auprc: { value: 0.792, ci: [0.76, 0.82] },
    f1: 0.81,
    sensitivity: 0.84,
    specificity: 0.79,
    ece: 0.031,
    brier: 0.142,
  };

  const subgroups: SubgroupResult[] = storedResult?.subgroups || [
    { name: "Age < 40", auroc: 0.86, n: 45, status: "pass" },
    { name: "Age 40-60", auroc: 0.85, n: 52, status: "pass" },
    { name: "Age > 60", auroc: 0.80, n: 45, status: "warn" },
    { name: "Male", auroc: 0.84, n: 78, status: "pass" },
    { name: "Female", auroc: 0.85, n: 64, status: "pass" },
  ];

  const externalValidation = storedResult?.externalValidation || {
    dataset: "MASS Database",
    n: 62,
    auroc: 0.83,
    status: "pass" as const,
  };

  const calibrationData = storedResult?.calibrationData || generateCalibrationData();

  return (
    <StepPageLayout
      stepNumber={6}
      title="Performance Evaluation"
      description="Evaluate model performance on test set and external data. Check AUROC, F1, and subgroup performance."
      prevPath="/train"
      nextPath="/explain"
      onNext={handleNext}
    >
      {/* Run Evaluation */}
      {!evaluationComplete && (
        <div className="card-elevated p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-primary" />
          </div>

          <h3 className="text-xl font-semibold mb-2">
            {isEvaluating ? "Evaluating Model..." : "Ready to Evaluate"}
          </h3>
          <p className="text-muted-foreground mb-6">
            Run comprehensive evaluation on test set and external data.
          </p>

          <Button
            size="lg"
            onClick={handleEvaluate}
            disabled={isEvaluating}
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Evaluation...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Evaluation
              </>
            )}
          </Button>
        </div>
      )}

      {evaluationComplete && (
        <>
          {/* Primary Metrics */}
          <div className="card-elevated p-6">
            <h3 className="font-semibold mb-4">Primary Metrics (Test Set)</h3>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-4xl font-bold text-primary">
                  {metrics.auroc.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">AUROC</div>
                <div className="text-xs text-muted-foreground">
                  [{metrics.auroc.ci[0]}, {metrics.auroc.ci[1]}] 95% CI
                </div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-4xl font-bold">{metrics.auprc.value}</div>
                <div className="text-sm text-muted-foreground mt-1">AUPRC</div>
                <div className="text-xs text-muted-foreground">
                  [{metrics.auprc.ci[0]}, {metrics.auprc.ci[1]}] 95% CI
                </div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-4xl font-bold">{metrics.f1}</div>
                <div className="text-sm text-muted-foreground mt-1">F1 Score</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold">{metrics.sensitivity}</div>
                <div className="text-xs text-muted-foreground">Sensitivity</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold">{metrics.specificity}</div>
                <div className="text-xs text-muted-foreground">Specificity</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold text-status-pass">{metrics.ece}</div>
                <div className="text-xs text-muted-foreground">ECE</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-2xl font-bold">{metrics.brier}</div>
                <div className="text-xs text-muted-foreground">Brier Score</div>
              </div>
            </div>
          </div>

          {/* Tabs for Details */}
          <Tabs defaultValue="subgroup" className="card-elevated">
            <div className="border-b px-4">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger value="subgroup" className="gap-2">
                  <Users className="w-4 h-4" />
                  Subgroup Analysis
                </TabsTrigger>
                <TabsTrigger value="external" className="gap-2">
                  <Target className="w-4 h-4" />
                  External Validation
                </TabsTrigger>
                <TabsTrigger value="calibration" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Calibration
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="subgroup" className="p-6">
              {/* Tab description */}
              <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-1">What is Subgroup Analysis?</h4>
                <p className="text-sm text-muted-foreground">
                  Verifies if the model <strong className="text-foreground">performs consistently across specific patient groups (age, gender, etc.)</strong>.
                  Even with good overall performance, lower performance in certain groups requires caution for clinical application.
                  A warning is shown if AUROC is more than 5% below the overall performance.
                </p>
              </div>
              <div className="space-y-3">
                {subgroups.map(group => (
                  <div
                    key={group.name}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border",
                      group.status === "warn" && "bg-status-warn/5 border-status-warn/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {group.status === "pass" ? (
                        <Check className="w-5 h-5 text-status-pass" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-status-warn" />
                      )}
                      <span className="font-medium">{group.name}</span>
                      <Badge variant="secondary">n = {group.n}</Badge>
                    </div>
                    <div className="font-mono">
                      AUROC: {group.auroc}
                    </div>
                  </div>
                ))}

                <div className="p-4 bg-status-warn/10 rounded-lg border border-status-warn/30 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-status-warn mt-0.5" />
                    <div>
                      <div className="font-medium text-status-warn">Subgroup Warning</div>
                      <div className="text-sm text-muted-foreground">
                        Age &gt;60 shows 5% performance drop. Consider age-stratified recalibration.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="external" className="p-6">
              {/* Tab description */}
              <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-1">What is External Validation?</h4>
                <p className="text-sm text-muted-foreground">
                  Tests model performance on <strong className="text-foreground">a completely different dataset not used for training</strong>.
                  If performance is maintained on data collected from different hospitals or equipment, the model is more likely to generalize in real clinical settings.
                </p>
              </div>
              <div className="p-6 bg-status-pass/5 rounded-lg border border-status-pass/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-status-pass" />
                    <div>
                      <div className="font-semibold">{externalValidation.dataset}</div>
                      <div className="text-sm text-muted-foreground">
                        External validation dataset
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-status-pass/10 text-status-pass border-0">
                    Validated
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-card rounded-lg">
                    <div className="text-3xl font-bold">{externalValidation.auroc}</div>
                    <div className="text-sm text-muted-foreground">AUROC</div>
                  </div>
                  <div className="text-center p-4 bg-card rounded-lg">
                    <div className="text-3xl font-bold">{externalValidation.n}</div>
                    <div className="text-sm text-muted-foreground">Subjects</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="calibration" className="p-6">
              {/* Tab description */}
              <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-1">What is Calibration?</h4>
                <p className="text-sm text-muted-foreground">
                  When the model predicts "80% probability of pattern presence," <strong className="text-foreground">80 out of 100 subjects should actually have the pattern</strong>.
                  Closer to the diagonal line means more reliable probability predictions.
                  Lower ECE (Expected Calibration Error) is better; generally <strong className="text-foreground">0.05 or below</strong> is considered good.
                </p>
              </div>
              <div className="max-w-lg mx-auto">
                <h4 className="font-medium mb-4 text-center">Calibration Curve (Expected vs Observed)</h4>
                <div className="h-[300px] w-full">
                  <CalibrationChart data={calibrationData} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold text-status-pass">{metrics.ece}</div>
                    <div className="text-xs text-muted-foreground">ECE (Expected Calibration Error)</div>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold">{metrics.brier}</div>
                    <div className="text-xs text-muted-foreground">Brier Score</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Success Message */}
          <div className="flex items-center gap-2 p-4 bg-status-pass/10 rounded-lg border border-status-pass/30">
            <Check className="w-5 h-5 text-status-pass" />
            <span className="text-status-pass font-medium">
              MetricsBundle saved. Proceed to explanation analysis.
            </span>
          </div>

          {/* Re-evaluate Button */}
          <Button variant="outline" onClick={() => setEvaluationComplete(false)}>
            Re-run Evaluation
          </Button>
        </>
      )}
    </StepPageLayout>
  );
}
