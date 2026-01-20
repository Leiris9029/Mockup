import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StepPageLayout } from "@/components/layout/StepPageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Check,
  Play,
  Loader2,
  Lightbulb,
  XCircle,
  Sparkles,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Target,
  Microscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore, Feature, FailureCase, Hypothesis } from "@/store/useProjectStore";
import { AttributionHeatmap } from "@/components/charts/AttributionHeatmap";

interface FeatureExtended extends Feature {
  description: string;
  scientificBasis: string;
  clinicalRelevance: string;
}

interface FailureCaseExtended extends FailureCase {
  subjectId: string;
  reasonDetail: string;
  detailedAnalysis: string;
  suggestedAction: string;
  signalCharacteristics: string[];
}

interface HypothesisExtended extends Hypothesis {
  textDetail: string;
  methodology: string;
  implications: string[];
  nextSteps: string[];
}

export default function ExplanationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, setExplanationResult, completeStep, setCurrentStep } = useProjectStore();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Load existing data from store
  useEffect(() => {
    if (currentProject?.explanationResult) {
      setAnalysisComplete(true);
    }
  }, [currentProject]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    await new Promise(resolve => setTimeout(resolve, 2500));

    // Mock explanation results with extended details
    const explanationResult = {
      topFeatures: [
        { name: "Sigma band power (12-15 Hz)", importance: 0.34, direction: "positive" as const },
        { name: "Spindle density", importance: 0.28, direction: "positive" as const },
        { name: "Stage N2 duration", importance: 0.18, direction: "positive" as const },
        { name: "Beta power (15-30 Hz)", importance: 0.12, direction: "negative" as const },
        { name: "Sleep efficiency", importance: 0.08, direction: "positive" as const },
      ],
      failureCases: [
        { id: "1", prediction: 0.78, actual: 0, reason: "High artifact contamination" },
        { id: "2", prediction: 0.23, actual: 1, reason: "Atypical spindle morphology" },
        { id: "3", prediction: 0.65, actual: 0, reason: "Borderline stage classification" },
      ],
      hypotheses: [
        {
          id: "1",
          text: "Sigma band power is the strongest predictor of sleep spindles, consistent with known spindle frequency range.",
          confidence: "high" as const,
          evidence: "Feature importance analysis + literature",
        },
        {
          id: "2",
          text: "Age-related performance drop may be due to decreased spindle density in older subjects.",
          confidence: "medium" as const,
          evidence: "Subgroup analysis + correlation study",
        },
        {
          id: "3",
          text: "Model may benefit from incorporating slow oscillation features for improved context.",
          confidence: "low" as const,
          evidence: "Error analysis patterns",
        },
      ],
    };

    // Save to store
    setExplanationResult(explanationResult);
    completeStep(9);
    setCurrentStep(10);

    setIsAnalyzing(false);
    setAnalysisComplete(true);
    toast({
      title: "Analysis Complete",
      description: "AI explanation analysis has been completed.",
    });
  };

  // Extended feature data with explanations
  const topFeaturesExtended: FeatureExtended[] = [
    {
      name: "Sigma band power (12-15 Hz)",
      importance: 0.34,
      direction: "positive",
      description: "Sigma Band Power (12-15 Hz)",
      scientificBasis: "The primary frequency band for target patterns (spindles). Power increases in this band as pattern activity intensifies.",
      clinicalRelevance: "This pattern is associated with memory consolidation and is a key indicator for sleep quality assessment.",
    },
    {
      name: "Spindle density",
      importance: 0.28,
      direction: "positive",
      description: "Pattern Density",
      scientificBasis: "The number of patterns detected per unit time, a direct indicator of pattern activity.",
      clinicalRelevance: "Decreased pattern density may be associated with cognitive decline and neurodegenerative diseases.",
    },
    {
      name: "Stage N2 duration",
      importance: 0.18,
      direction: "positive",
      description: "N2 Stage Duration",
      scientificBasis: "Since target patterns mainly occur during N2 stage, longer N2 duration increases pattern observation opportunities.",
      clinicalRelevance: "In normal adults, N2 accounts for approximately 45-55% of total sleep.",
    },
    {
      name: "Beta power (15-30 Hz)",
      importance: 0.12,
      direction: "negative",
      description: "Beta Band Power (15-30 Hz)",
      scientificBasis: "Beta waves are associated with wakefulness; high beta activity during sleep may indicate sleep disorders or artifacts.",
      clinicalRelevance: "Excessive beta activity during sleep may signal insomnia, anxiety, or electrode problems.",
    },
    {
      name: "Sleep efficiency",
      importance: 0.08,
      direction: "positive",
      description: "Sleep Efficiency",
      scientificBasis: "The ratio of actual sleep time to total time in bed, an indicator of overall sleep quality.",
      clinicalRelevance: "Sleep efficiency above 85% is considered normal; lower efficiency suggests sleep disorders.",
    },
  ];

  // Extended failure case data
  // actual: 1 = expert judged pattern present, 0 = expert judged pattern absent
  // prediction: model predicted pattern probability
  const failureCasesExtended: FailureCaseExtended[] = [
    {
      id: "1",
      subjectId: "SUB_042",
      prediction: 0.78,
      actual: 0,
      reason: "High artifact contamination",
      reasonDetail: "False Positive - Artifact Contamination",
      detailedAnalysis: "Model predicted pattern presence (78%), but expert judgment found no actual pattern. High power in sigma band was detected, but it was caused by EMG artifact.",
      suggestedAction: "Consider enhancing EMG artifact removal in preprocessing, or add artifact detection capability to the model.",
      signalCharacteristics: ["EMG interference (>20μV)", "Abnormal inter-channel correlation", "Sudden amplitude changes"],
    },
    {
      id: "2",
      subjectId: "SUB_089",
      prediction: 0.23,
      actual: 1,
      reason: "Atypical spindle morphology",
      reasonDetail: "False Negative - Atypical Pattern Morphology",
      detailedAnalysis: "Model predicted pattern absence (23%), but expert judgment found actual pattern present. The pattern showed atypical characteristics (low amplitude, short duration) that the model failed to recognize.",
      suggestedAction: "Consider additional training with elderly data or developing age-specific sub-models.",
      signalCharacteristics: ["Low signal amplitude (<10μV)", "Short duration (<0.3s)", "Irregular waveform"],
    },
    {
      id: "3",
      subjectId: "SUB_156",
      prediction: 0.65,
      actual: 0,
      reason: "Borderline stage classification",
      reasonDetail: "False Positive - Borderline Case",
      detailedAnalysis: "Model predicted pattern presence (65%), but expert judgment found it was not the target pattern. Similar activity in N1/N2 transition zone was misidentified.",
      suggestedAction: "Consider using sleep stage information as additional input feature, or raise decision threshold to 0.7.",
      signalCharacteristics: ["N1↔N2 transition zone", "Incomplete waveform", "K-complex absence"],
    },
  ];

  // Extended hypothesis data
  const hypothesesExtended: HypothesisExtended[] = [
    {
      id: "1",
      text: "Sigma band power is the strongest predictor of sleep spindles, consistent with known spindle frequency range.",
      textDetail: "Sigma band power is the strongest predictor for target patterns, consistent with known pattern frequency range.",
      confidence: "high",
      evidence: "Feature importance analysis + literature",
      methodology: "Feature importance was quantified through SHAP value analysis + literature review. The 12-15Hz band showed 34% contribution to overall predictions.",
      implications: [
        "Confirms model correctly learned physiological characteristics of patterns",
        "Suggests sigma band extraction is a critical preprocessing step",
        "Supports model reliability through consistency with other research",
      ],
      nextSteps: [
        "Perform detailed frequency analysis within sigma band",
        "Explore individual-optimal frequency bands",
      ],
    },
    {
      id: "2",
      text: "Age-related performance drop may be due to decreased spindle density in older subjects.",
      textDetail: "Age-related performance degradation may be associated with decreased pattern density in elderly subjects.",
      confidence: "medium",
      evidence: "Subgroup analysis + correlation study",
      methodology: "Observed performance drop in 60+ subgroup with AUROC 0.78 (overall: 0.85). Correlation coefficient between pattern density and age: r=-0.42 (p<0.01).",
      implications: [
        "Model improvement needed for elderly data",
        "Consider applying age-correction algorithm",
        "May need to redefine pattern characteristics for elderly",
      ],
      nextSteps: [
        "Perform additional age-stratified analysis",
        "Review elderly-specific model or ensemble approach",
        "Research age-specific pattern criteria in literature",
      ],
    },
    {
      id: "3",
      text: "Model may benefit from incorporating slow oscillation features for improved context.",
      textDetail: "Adding slow oscillation features may improve model performance.",
      confidence: "low",
      evidence: "Error analysis patterns",
      methodology: "Error case analysis showed increased error frequency in segments with weak slow oscillation-pattern coupling (28% vs average 15%).",
      implications: [
        "Pattern-slow oscillation interaction may provide important context",
        "Current model does not fully utilize this information",
        "Room for additional feature engineering exists",
      ],
      nextSteps: [
        "Experiment with adding 0.5-1Hz band features",
        "Analyze pattern-SO phase synchronization",
        "Apply multi-time-scale analysis",
      ],
    },
  ];

  const handleNext = () => {
    navigate("/export");
  };


  return (
    <StepPageLayout
      stepNumber={7}
      title="Explanation & Analysis"
      description="Mechanistic Interpretability analysis. Understand how the model internally processes signals, which neural circuits activate, internal feature detectors, and model mechanisms."
      prevPath="/evaluate"
      nextPath="/export"
      onNext={handleNext}
    >
      {/* Run Analysis */}
      {!analysisComplete && (
        <div className="card-elevated p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-primary" />
          </div>

          <h3 className="text-xl font-semibold mb-2">
            {isAnalyzing ? "Generating Mechanistic Analysis..." : "Ready for Mechanistic Interpretability Analysis"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {isAnalyzing
              ? "Analyzing internal neural circuits, activation patterns, and mechanistic pathways."
              : "Reverse-engineer model internals to understand computational mechanisms and feature detectors."
            }
          </p>

          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Mechanistic Analysis
              </>
            )}
          </Button>
        </div>
      )}

      {analysisComplete && (
        <>
          <Tabs defaultValue="features" className="card-elevated">
            <div className="border-b px-4">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger value="features" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Feature Importance
                </TabsTrigger>
                <TabsTrigger value="attribution" className="gap-2">
                  <Brain className="w-4 h-4" />
                  Attribution Map
                </TabsTrigger>
                <TabsTrigger value="failures" className="gap-2">
                  <XCircle className="w-4 h-4" />
                  Failure Analysis
                </TabsTrigger>
                <TabsTrigger value="hypotheses" className="gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Hypotheses
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="features" className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="font-semibold">Learned Feature Detectors</h4>
                <Badge variant="outline" className="text-xs">Neural Circuit Analysis</Badge>
              </div>

              <div className="space-y-6">
                {topFeaturesExtended.map((feature, index) => (
                  <div key={feature.name} className="p-4 bg-muted/20 rounded-lg">
                    {/* Feature header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                          index === 0 ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-medium">{feature.description}</span>
                          <span className="text-xs text-muted-foreground ml-2">({feature.name})</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "ml-2",
                            feature.direction === "positive"
                              ? "bg-status-pass/10 text-status-pass"
                              : "bg-status-fail/10 text-status-fail"
                          )}
                        >
                          {feature.direction === "positive" ? "↑ Increases prediction" : "↓ Decreases prediction"}
                        </Badge>
                      </div>
                      <span className="font-mono text-lg font-bold">{(feature.importance * 100).toFixed(1)}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          feature.direction === "positive" ? "bg-status-pass" : "bg-status-fail"
                        )}
                        style={{ width: `${feature.importance * 100 * 2.5}%` }}
                      />
                    </div>

                    {/* Detailed explanation */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-background rounded border">
                        <div className="flex items-center gap-1 text-xs text-primary font-medium mb-1">
                          <BookOpen className="w-3 h-3" />
                          Scientific Basis
                        </div>
                        <p className="text-muted-foreground">{feature.scientificBasis}</p>
                      </div>
                      <div className="p-3 bg-background rounded border">
                        <div className="flex items-center gap-1 text-xs text-status-pass font-medium mb-1">
                          <Target className="w-3 h-3" />
                          Clinical Relevance
                        </div>
                        <p className="text-muted-foreground">{feature.clinicalRelevance}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="attribution" className="p-6">
              <h4 className="font-semibold mb-4">Internal Activation Patterns</h4>
              <AttributionHeatmap
                channels={["Fp1", "Fp2", "F3", "F4", "C3", "C4", "P3", "P4", "O1", "O2"]}
                timePoints={20}
                frequencies={["Delta", "Theta", "Alpha", "Sigma", "Beta"]}
              />
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Mechanistic Interpretation</h5>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded mt-0.5 shrink-0" />
                    <span><strong>Green regions</strong>: High neuron activation in sigma-band detector circuit. These neurons fire when specific oscillatory patterns are detected in the signal.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded mt-0.5 shrink-0" />
                    <span><strong>Red regions</strong>: Inhibitory neuron activation. These suppress pattern detection when high-frequency artifacts or wake-like activity is present.</span>
                  </li>
                </ul>
                <div className="mt-3 p-3 bg-primary/5 rounded border border-primary/20">
                  <div className="text-sm font-medium text-primary mb-1">Discovered Neural Circuits</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Layer 2-3 neurons implement a sigma band (12-15 Hz) oscillation detector</li>
                    <li>• Layer 4 forms a spatial filter selective for central channels (C3, C4)</li>
                    <li>• Layer 5 contains inhibitory units that detect beta band artifacts (&gt;15 Hz)</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="failures" className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="font-semibold">Failure Case Detailed Analysis</h4>
                <Badge variant="outline" className="text-xs">Total {failureCasesExtended.length} cases</Badge>
              </div>

              <div className="space-y-4">
                {failureCasesExtended.map(fc => (
                  <div
                    key={fc.id}
                    className="p-4 bg-status-fail/5 rounded-lg border border-status-fail/30"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-status-fail" />
                        <span className="font-medium">Case #{fc.id}</span>
                        <Badge variant="outline" className="text-xs">{fc.subjectId}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-mono">
                          Model Prediction: <span className="text-primary font-bold">{(fc.prediction * 100).toFixed(0)}%</span>
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono">
                          Expert Judgment: <span className={cn(
                            "font-bold",
                            fc.actual === 1 ? "text-status-pass" : "text-status-fail"
                          )}>{fc.actual === 1 ? "Pattern Present" : "Pattern Absent"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-3">
                      <div className="text-sm font-medium text-status-fail mb-1">{fc.reasonDetail}</div>
                      <p className="text-sm text-muted-foreground">{fc.detailedAnalysis}</p>
                    </div>

                    {/* Signal characteristics */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {fc.signalCharacteristics.map((char, i) => (
                        <Badge key={i} variant="secondary" className="text-xs bg-muted">
                          {char}
                        </Badge>
                      ))}
                    </div>

                    {/* Suggested action */}
                    <div className="p-3 bg-primary/5 rounded border border-primary/20">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-primary mb-1">Suggested Action</div>
                          <p className="text-sm text-muted-foreground">{fc.suggestedAction}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">Error Type Distribution</h5>
                <p className="text-xs text-muted-foreground mb-3">
                  Classification of model errors by cause.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-background rounded">
                    <div className="text-2xl font-bold text-status-fail">40%</div>
                    <div className="text-xs text-muted-foreground">Artifact False Positive</div>
                    <div className="text-xs text-status-fail/70">Predicted pattern when absent</div>
                  </div>
                  <div className="text-center p-3 bg-background rounded">
                    <div className="text-2xl font-bold text-status-warn">25%</div>
                    <div className="text-xs text-muted-foreground">Atypical False Negative</div>
                    <div className="text-xs text-status-warn/70">Missed pattern when present</div>
                  </div>
                  <div className="text-center p-3 bg-background rounded">
                    <div className="text-2xl font-bold">35%</div>
                    <div className="text-xs text-muted-foreground">Borderline False Positive</div>
                    <div className="text-xs text-muted-foreground/70">Misidentified ambiguous segment</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hypotheses" className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="font-semibold">Mechanistic Insights</h4>
                <Badge variant="outline" className="text-xs">Circuit-level understanding</Badge>
              </div>

              <div className="space-y-6">
                {hypothesesExtended.map(h => (
                  <div
                    key={h.id}
                    className={cn(
                      "p-5 rounded-lg border",
                      h.confidence === "high" ? "bg-status-pass/5 border-status-pass/30" :
                      h.confidence === "medium" ? "bg-status-warn/5 border-status-warn/30" :
                      "bg-muted/30 border-border"
                    )}
                  >
                    {/* Hypothesis header */}
                    <div className="flex items-start gap-3 mb-4">
                      <Lightbulb className={cn(
                        "w-6 h-6 mt-0.5 shrink-0",
                        h.confidence === "high" ? "text-status-pass" :
                        h.confidence === "medium" ? "text-status-warn" :
                        "text-muted-foreground"
                      )} />
                      <div className="flex-1">
                        <p className="font-medium text-lg">{h.textDetail}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="secondary"
                            className={cn(
                              h.confidence === "high" ? "bg-status-pass/10 text-status-pass" :
                              h.confidence === "medium" ? "bg-status-warn/10 text-status-warn" :
                              "bg-muted"
                            )}
                          >
                            {h.confidence === "high" ? "High Confidence" :
                             h.confidence === "medium" ? "Medium Confidence" : "Low Confidence"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Methodology */}
                    <div className="p-3 bg-background rounded border mb-3">
                      <div className="flex items-center gap-1 text-xs font-medium text-primary mb-1">
                        <Microscope className="w-3 h-3" />
                        Analysis Methodology
                      </div>
                      <p className="text-sm text-muted-foreground">{h.methodology}</p>
                    </div>

                    {/* Implications and Next Steps */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-background rounded border">
                        <div className="flex items-center gap-1 text-xs font-medium text-status-warn mb-2">
                          <AlertTriangle className="w-3 h-3" />
                          Implications
                        </div>
                        <ul className="space-y-1">
                          {h.implications.map((imp, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-status-warn">•</span>
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-background rounded border">
                        <div className="flex items-center gap-1 text-xs font-medium text-primary mb-2">
                          <TrendingUp className="w-3 h-3" />
                          Next Steps
                        </div>
                        <ul className="space-y-1">
                          {h.nextSteps.map((step, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary font-medium">{i + 1}.</span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center gap-2 p-4 bg-status-pass/10 rounded-lg border border-status-pass/30">
            <Check className="w-5 h-5 text-status-pass" />
            <span className="text-status-pass font-medium">
              ExplainBundle saved. Ready to generate report.
            </span>
          </div>

          {/* Re-analyze Button */}
          <Button variant="outline" onClick={() => setAnalysisComplete(false)}>
            Re-run Analysis
          </Button>
        </>
      )}
    </StepPageLayout>
  );
}
