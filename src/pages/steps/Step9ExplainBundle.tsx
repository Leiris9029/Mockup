import { useState } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Check,
  AlertTriangle,
  BarChart3,
  Eye,
  FileText,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureImportance {
  name: string;
  importance: number;
  clinicalRelevance: "high" | "medium" | "low";
}

export default function Step9ExplainBundle() {
  const [plausibilityScore, setPlausibilityScore] = useState(8);

  const featureImportances: FeatureImportance[] = [
    { name: "Sleep Spindle Density", importance: 0.23, clinicalRelevance: "high" },
    { name: "Slow Oscillation Power", importance: 0.19, clinicalRelevance: "high" },
    { name: "Sigma Band Coherence", importance: 0.15, clinicalRelevance: "high" },
    { name: "Delta/Theta Ratio", importance: 0.12, clinicalRelevance: "medium" },
    { name: "Alpha Peak Frequency", importance: 0.09, clinicalRelevance: "medium" },
    { name: "Beta Power", importance: 0.07, clinicalRelevance: "medium" },
    { name: "Frontal Asymmetry", importance: 0.06, clinicalRelevance: "low" },
    { name: "Gamma Activity", importance: 0.05, clinicalRelevance: "low" },
    { name: "HRV Features", importance: 0.04, clinicalRelevance: "low" },
  ];

  const failureCases = [
    {
      id: "case_042",
      prediction: 0.72,
      actual: 0,
      reason: "비전형적 수면 패턴 (shift worker)",
    },
    {
      id: "case_087",
      prediction: 0.31,
      actual: 1,
      reason: "매우 짧은 녹화 시간 (4.2h)",
    },
    {
      id: "case_103",
      prediction: 0.68,
      actual: 0,
      reason: "높은 아티팩트 비율 (28%)",
    },
  ];

  const hypotheses = [
    {
      id: 1,
      text: "Sleep spindle density 감소가 항경련제 중단 후 재발과 연관됨",
      confidence: "high",
      literature: 3,
    },
    {
      id: 2,
      text: "Sigma band coherence 저하가 뇌전증 네트워크 불안정성을 반영",
      confidence: "medium",
      literature: 2,
    },
    {
      id: 3,
      text: "Delta/Theta ratio 이상이 피질 과흥분성의 지표일 가능성",
      confidence: "low",
      literature: 1,
    },
  ];

  return (
    <StepLayout
      currentStep={9}
      title="설명 분석"
      description="모델 예측에 대한 설명과 해석을 제공합니다."
      input={{ label: "Model + MetricsBundle", description: "모델과 지표" }}
      output={{ label: "ExplainBundle", description: "설명 분석 결과" }}
    >
      <div className="max-w-5xl space-y-6">
        {/* Mechanistic Interpretability Score */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Mechanistic Interpretability Score (A5)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                신경 회로 수준 설명의 일관성 점수
              </p>
            </div>
            <div className="text-center">
              <div className={cn(
                "text-5xl font-bold",
                plausibilityScore >= 7 ? "text-status-pass" : "text-status-warn"
              )}>
                {plausibilityScore}/10
              </div>
              <Badge
                variant={plausibilityScore >= 7 ? "default" : "secondary"}
                className={plausibilityScore >= 7 ? "bg-status-pass" : ""}
              >
                {plausibilityScore >= 7 ? "통과" : "검토 필요"}
              </Badge>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm">
              <strong>메커니즘 분석:</strong> 모델 내부의 뉴런들이 sleep spindle density, slow oscillation power,
              sigma band coherence를 감지하는 특화된 회로를 형성했음. 각 레이어가 생리학적으로 의미 있는
              특징 검출기로 자가 조직화되었으며, 이는 수면 신경생리학의 계층적 구조를 반영함.
            </p>
          </div>
        </div>

        <Tabs defaultValue="features">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="features" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Neural Circuits
            </TabsTrigger>
            <TabsTrigger value="failures" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Failure Cases
            </TabsTrigger>
            <TabsTrigger value="hypotheses" className="gap-2">
              <FileText className="w-4 h-4" />
              Mechanisms
            </TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="mt-4">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h4 className="font-semibold">Discovered Neural Circuits</h4>
                <p className="text-sm text-muted-foreground">Internal feature detectors and their activation patterns</p>
              </div>

              <div className="p-4 space-y-3">
                {featureImportances.map((feature, index) => (
                  <div key={feature.name} className="flex items-center gap-4">
                    <div className="w-6 text-sm text-muted-foreground font-mono">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{feature.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            feature.clinicalRelevance === "high" && "border-status-pass text-status-pass",
                            feature.clinicalRelevance === "medium" && "border-status-warn text-status-warn",
                            feature.clinicalRelevance === "low" && "border-muted-foreground"
                          )}>
                            {feature.clinicalRelevance} relevance
                          </Badge>
                          <span className="font-mono text-sm">{(feature.importance * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            feature.clinicalRelevance === "high" && "bg-status-pass",
                            feature.clinicalRelevance === "medium" && "bg-status-warn",
                            feature.clinicalRelevance === "low" && "bg-muted-foreground"
                          )}
                          style={{ width: `${feature.importance * 100 * 4}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted/30 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-status-pass" />
                  <span>상위 3개 신경 회로가 모두 생리학적으로 해석 가능한 특징을 학습함</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="failures" className="mt-4">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h4 className="font-semibold">Failure Case Analysis</h4>
                <p className="text-sm text-muted-foreground">예측 실패 케이스 분석</p>
              </div>

              <div className="divide-y">
                {failureCases.map(fc => (
                  <div key={fc.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm">{fc.id}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          Predicted: <span className="font-mono">{fc.prediction}</span>
                        </span>
                        <span>
                          Actual: <span className={cn(
                            "font-mono font-bold",
                            fc.actual === 1 ? "text-status-fail" : "text-status-pass"
                          )}>
                            {fc.actual === 1 ? "재발" : "비재발"}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-status-warn/10 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-status-warn">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{fc.reason}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted/30 border-t">
                <p className="text-sm text-muted-foreground">
                  대부분의 실패 케이스는 데이터 품질 이슈와 관련됨.
                  모델 자체의 systematic error보다는 edge case에 해당.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hypotheses" className="mt-4">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h4 className="font-semibold">Mechanistic Understanding</h4>
                <p className="text-sm text-muted-foreground">모델 내부 작동 메커니즘 분석</p>
              </div>

              <div className="divide-y">
                {hypotheses.map(h => (
                  <div key={h.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm">{h.text}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className={cn(
                            h.confidence === "high" && "border-status-pass text-status-pass",
                            h.confidence === "medium" && "border-status-warn text-status-warn",
                            h.confidence === "low" && ""
                          )}>
                            {h.confidence} confidence
                          </Badge>
                          <span>{h.literature} supporting papers</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Success Message */}
        <div className="flex items-center gap-2 p-3 bg-status-pass/10 rounded-lg border border-status-pass/30">
          <Check className="w-5 h-5 text-status-pass" />
          <span className="text-status-pass font-medium">
            ExplainBundle이 생성되었습니다. 다음 단계로 진행하세요.
          </span>
        </div>
      </div>
    </StepLayout>
  );
}
