import { useState } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CriteriaItem {
  id: string;
  text: string;
  type: "include" | "exclude";
  enabled: boolean;
}

export default function Step2CohortSpec() {
  const [criteria, setCriteria] = useState<CriteriaItem[]>([
    { id: "1", text: "연령 18세 이상 65세 이하", type: "include", enabled: true },
    { id: "2", text: "뇌전증 진단 확인된 환자", type: "include", enabled: true },
    { id: "3", text: "항경련제 중단 이력 있음", type: "include", enabled: true },
    { id: "4", text: "EEG 검사 기록 존재", type: "include", enabled: true },
    { id: "5", text: "중증 인지장애 환자", type: "exclude", enabled: true },
    { id: "6", text: "다른 신경학적 질환 동반", type: "exclude", enabled: true },
    { id: "7", text: "EEG 품질 불량 (artifact > 30%)", type: "exclude", enabled: true },
  ]);

  const [labelColumn, setLabelColumn] = useState("recurrence");
  const [isApplied, setIsApplied] = useState(false);

  const includeCriteria = criteria.filter(c => c.type === "include");
  const excludeCriteria = criteria.filter(c => c.type === "exclude");

  const toggleCriteria = (id: string) => {
    setCriteria(prev =>
      prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c)
    );
  };

  const handleApply = () => {
    setIsApplied(true);
  };

  // Mock cohort stats
  const cohortStats = {
    total: 150,
    afterInclusion: 132,
    afterExclusion: 102,
    labelPositive: 34,
    labelNegative: 68,
    prevalence: 33.3,
  };

  return (
    <StepLayout
      currentStep={2}
      title="코호트 정의"
      description="포함/제외 기준과 라벨 정의를 설정합니다."
      input={{ label: "메타데이터", description: ".csv" }}
      output={{ label: "CohortSpec", description: "코호트 정의서" }}
    >
      <div className="max-w-4xl space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Inclusion Criteria */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-status-pass/20 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-status-pass" />
                </div>
                <h3 className="font-semibold">포함 기준 (Inclusion)</h3>
              </div>
              <Badge variant="secondary">{includeCriteria.filter(c => c.enabled).length}개</Badge>
            </div>

            <div className="space-y-2">
              {includeCriteria.map(item => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    item.enabled ? "bg-status-pass/5 border-status-pass/30" : "bg-muted/30"
                  )}
                >
                  <Checkbox
                    checked={item.enabled}
                    onCheckedChange={() => toggleCriteria(item.id)}
                  />
                  <span className={cn("text-sm", !item.enabled && "text-muted-foreground")}>
                    {item.text}
                  </span>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-2 text-primary">
                <Plus className="w-4 h-4 mr-1" />
                기준 추가
              </Button>
            </div>
          </div>

          {/* Exclusion Criteria */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-status-fail/20 flex items-center justify-center">
                  <Minus className="w-4 h-4 text-status-fail" />
                </div>
                <h3 className="font-semibold">제외 기준 (Exclusion)</h3>
              </div>
              <Badge variant="secondary">{excludeCriteria.filter(c => c.enabled).length}개</Badge>
            </div>

            <div className="space-y-2">
              {excludeCriteria.map(item => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    item.enabled ? "bg-status-fail/5 border-status-fail/30" : "bg-muted/30"
                  )}
                >
                  <Checkbox
                    checked={item.enabled}
                    onCheckedChange={() => toggleCriteria(item.id)}
                  />
                  <span className={cn("text-sm", !item.enabled && "text-muted-foreground")}>
                    {item.text}
                  </span>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full mt-2 text-primary">
                <Plus className="w-4 h-4 mr-1" />
                기준 추가
              </Button>
            </div>
          </div>
        </div>

        {/* Label Definition */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-semibold">라벨 정의</h3>
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">라벨 컬럼</label>
              <select
                value={labelColumn}
                onChange={(e) => setLabelColumn(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-lg bg-background"
              >
                <option value="recurrence">recurrence (재발 여부)</option>
                <option value="outcome">outcome (치료 결과)</option>
                <option value="severity">severity (중증도)</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground">라벨 타입</label>
              <div className="flex gap-2 mt-1">
                <Button variant="default" size="sm">Binary</Button>
                <Button variant="outline" size="sm">Multi-class</Button>
                <Button variant="outline" size="sm">Regression</Button>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>라벨 정의:</span>
              <code className="px-2 py-0.5 bg-muted rounded">positive = recurrence == 1</code>
              <code className="px-2 py-0.5 bg-muted rounded">negative = recurrence == 0</code>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <Button
          size="lg"
          className="w-full bg-rose-500 hover:bg-rose-600 text-white"
          onClick={handleApply}
        >
          코호트 기준 적용
        </Button>

        {/* Result */}
        {isApplied && (
          <div className="space-y-4">
            {/* Cohort Flow */}
            <div className="bg-card rounded-lg border p-4">
              <h4 className="font-semibold mb-4">코호트 필터링 결과</h4>

              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold">{cohortStats.total}</span>
                  </div>
                  <span className="text-muted-foreground mt-1 block">전체</span>
                </div>

                <div className="flex-1 border-t-2 border-dashed border-muted mx-4" />

                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-status-pass/20 flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-status-pass">{cohortStats.afterInclusion}</span>
                  </div>
                  <span className="text-muted-foreground mt-1 block">포함 후</span>
                </div>

                <div className="flex-1 border-t-2 border-dashed border-muted mx-4" />

                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-primary">{cohortStats.afterExclusion}</span>
                  </div>
                  <span className="text-muted-foreground mt-1 block">최종 코호트</span>
                </div>
              </div>
            </div>

            {/* Label Distribution */}
            <div className="bg-card rounded-lg border p-4">
              <h4 className="font-semibold mb-4">라벨 분포</h4>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold">{cohortStats.labelPositive}</div>
                  <div className="text-sm text-muted-foreground">Positive (재발)</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold">{cohortStats.labelNegative}</div>
                  <div className="text-sm text-muted-foreground">Negative (비재발)</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-3xl font-bold">{cohortStats.prevalence}%</div>
                  <div className="text-sm text-muted-foreground">Prevalence</div>
                </div>
              </div>

              {cohortStats.prevalence < 20 && (
                <div className="mt-4 p-3 bg-status-warn/10 border border-status-warn/30 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-status-warn mt-0.5" />
                  <span className="text-sm text-status-warn">
                    클래스 불균형 감지: Positive 비율이 20% 미만입니다. SMOTE 또는 class weight 조정을 권장합니다.
                  </span>
                </div>
              )}
            </div>

            {/* Success Message */}
            <div className="flex items-center gap-2 p-3 bg-status-pass/10 rounded-lg border border-status-pass/30">
              <Check className="w-5 h-5 text-status-pass" />
              <span className="text-status-pass font-medium">
                CohortSpec이 생성되었습니다. 다음 단계로 진행하세요.
              </span>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  );
}
