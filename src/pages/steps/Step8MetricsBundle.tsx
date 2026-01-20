import { useState } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Check,
  AlertTriangle,
  Target,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricResult {
  id: string;
  name: string;
  value: string;
  ci?: string;
  threshold?: string;
  status: "pass" | "warn" | "fail";
}

export default function Step8MetricsBundle() {
  const [selectedTab, setSelectedTab] = useState("internal");

  const internalMetrics: MetricResult[] = [
    { id: "auroc", name: "AUROC", value: "0.847", ci: "[0.82, 0.87]", threshold: "> 0.80", status: "pass" },
    { id: "auprc", name: "AUPRC", value: "0.792", ci: "[0.76, 0.82]", threshold: "> 0.70", status: "pass" },
    { id: "sensitivity", name: "Sensitivity", value: "0.83", ci: "[0.78, 0.88]", threshold: "> 0.80", status: "pass" },
    { id: "specificity", name: "Specificity", value: "0.90", ci: "[0.86, 0.94]", threshold: "> 0.85", status: "pass" },
    { id: "f1", name: "F1 Score", value: "0.81", ci: "[0.77, 0.85]", threshold: "> 0.75", status: "pass" },
    { id: "ece", name: "ECE", value: "0.032", threshold: "< 0.05", status: "pass" },
  ];

  const externalMetrics: MetricResult[] = [
    { id: "auroc", name: "AUROC", value: "0.820", ci: "[0.78, 0.86]", threshold: "Δ < 5%", status: "pass" },
    { id: "auprc", name: "AUPRC", value: "0.764", ci: "[0.72, 0.81]", threshold: "Δ < 5%", status: "pass" },
    { id: "sensitivity", name: "Sensitivity", value: "0.79", ci: "[0.73, 0.85]", threshold: "Δ < 5%", status: "warn" },
    { id: "specificity", name: "Specificity", value: "0.88", ci: "[0.83, 0.93]", threshold: "Δ < 5%", status: "pass" },
    { id: "ece", name: "ECE", value: "0.041", threshold: "< 0.05", status: "pass" },
  ];

  const subgroupMetrics = [
    { group: "Age < 60", n: 523, auroc: "0.861", gap: "+1.7%", status: "pass" as const },
    { group: "Age ≥ 60", n: 342, auroc: "0.792", gap: "-6.5%", status: "warn" as const },
    { group: "Male", n: 445, auroc: "0.839", gap: "-0.9%", status: "pass" as const },
    { group: "Female", n: 420, auroc: "0.855", gap: "+0.9%", status: "pass" as const },
  ];

  const aMetricsStatus = [
    { id: "A0", name: "Primary Metric", status: "pass" as const },
    { id: "A1", name: "External Validation", status: "pass" as const },
    { id: "A2", name: "Calibration", status: "pass" as const },
    { id: "A3", name: "Sens @ Spec", status: "pass" as const },
    { id: "A4", name: "Subgroup Gap", status: "warn" as const },
  ];

  return (
    <StepLayout
      currentStep={8}
      title="성능 평가"
      description="모델 성능을 다양한 관점에서 평가합니다."
      input={{ label: "Model Checkpoint", description: "학습된 모델" }}
      output={{ label: "MetricsBundle", description: "성능 지표 모음" }}
    >
      <div className="max-w-5xl space-y-6">
        {/* A-Metrics Summary */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">A-Metrics 체크리스트</h3>
            </div>
            <Badge variant="secondary">4/5 통과</Badge>
          </div>

          <div className="flex gap-2">
            {aMetricsStatus.map(metric => (
              <div
                key={metric.id}
                className={cn(
                  "flex-1 p-3 rounded-lg text-center",
                  metric.status === "pass" && "bg-status-pass/10 border border-status-pass/30",
                  metric.status === "warn" && "bg-status-warn/10 border border-status-warn/30",
                  metric.status === "fail" && "bg-status-fail/10 border border-status-fail/30"
                )}
              >
                <div className={cn(
                  "text-sm font-mono font-bold",
                  metric.status === "pass" && "text-status-pass",
                  metric.status === "warn" && "text-status-warn",
                  metric.status === "fail" && "text-status-fail"
                )}>
                  {metric.id}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{metric.name}</div>
                <div className="mt-2">
                  {metric.status === "pass" ? (
                    <Check className="w-4 h-4 text-status-pass mx-auto" />
                  ) : metric.status === "warn" ? (
                    <AlertTriangle className="w-4 h-4 text-status-warn mx-auto" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-status-fail mx-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="internal" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Internal Test
            </TabsTrigger>
            <TabsTrigger value="external" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              External Validation
            </TabsTrigger>
            <TabsTrigger value="subgroup" className="gap-2">
              <Users className="w-4 h-4" />
              Subgroup Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="internal" className="mt-4">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h4 className="font-semibold">Internal Test Set 성능</h4>
                <p className="text-sm text-muted-foreground">n = 184 (Test split)</p>
              </div>

              <div className="divide-y">
                {internalMetrics.map(metric => (
                  <div key={metric.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      {metric.threshold && (
                        <div className="text-xs text-muted-foreground">기준: {metric.threshold}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold font-mono">{metric.value}</div>
                        {metric.ci && (
                          <div className="text-xs text-muted-foreground font-mono">{metric.ci}</div>
                        )}
                      </div>
                      {metric.status === "pass" ? (
                        <Check className="w-5 h-5 text-status-pass" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-status-warn" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="external" className="mt-4">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h4 className="font-semibold">External Validation 성능</h4>
                <p className="text-sm text-muted-foreground">MASS Dataset (n = 62)</p>
              </div>

              <div className="divide-y">
                {externalMetrics.map(metric => (
                  <div key={metric.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{metric.name}</div>
                      {metric.threshold && (
                        <div className="text-xs text-muted-foreground">기준: {metric.threshold}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold font-mono">{metric.value}</div>
                        {metric.ci && (
                          <div className="text-xs text-muted-foreground font-mono">{metric.ci}</div>
                        )}
                      </div>
                      {metric.status === "pass" ? (
                        <Check className="w-5 h-5 text-status-pass" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-status-warn" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted/30">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-status-pass" />
                  <span>Internal vs External AUROC 차이: <strong>3.2%</strong> (기준: &lt; 5%)</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="subgroup" className="mt-4">
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b">
                <h4 className="font-semibold">Subgroup Robustness (A4)</h4>
                <p className="text-sm text-muted-foreground">인구통계학적 서브그룹별 성능 차이</p>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Subgroup</th>
                    <th className="text-center p-4">n</th>
                    <th className="text-center p-4">AUROC</th>
                    <th className="text-center p-4">Gap</th>
                    <th className="text-center p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subgroupMetrics.map(sg => (
                    <tr key={sg.group} className="border-b">
                      <td className="p-4 font-medium">{sg.group}</td>
                      <td className="p-4 text-center font-mono">{sg.n}</td>
                      <td className="p-4 text-center font-mono">{sg.auroc}</td>
                      <td className={cn(
                        "p-4 text-center font-mono",
                        sg.status === "pass" ? "text-status-pass" : "text-status-warn"
                      )}>
                        {sg.gap}
                      </td>
                      <td className="p-4 text-center">
                        {sg.status === "pass" ? (
                          <Check className="w-4 h-4 text-status-pass mx-auto" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-status-warn mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-4 bg-status-warn/10 border-t border-status-warn/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-status-warn mt-0.5" />
                  <div className="text-sm">
                    <span className="font-medium text-status-warn">최대 서브그룹 gap: 8.2%</span>
                    <p className="text-muted-foreground">Age ≥ 60 그룹에서 성능 저하 감지. 기준(10%) 이내이나 주의 필요.</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Success Message */}
        <div className="flex items-center gap-2 p-3 bg-status-pass/10 rounded-lg border border-status-pass/30">
          <Check className="w-5 h-5 text-status-pass" />
          <span className="text-status-pass font-medium">
            MetricsBundle이 생성되었습니다. 다음 단계로 진행하세요.
          </span>
        </div>
      </div>
    </StepLayout>
  );
}
