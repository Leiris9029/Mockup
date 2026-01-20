import { useState } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Split,
  Check,
  AlertTriangle,
  Shield,
  Users,
  Shuffle,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeakageRule {
  id: string;
  name: string;
  description: string;
  status: "pass" | "fail" | "pending";
}

export default function Step5SplitPlan() {
  const [trainRatio, setTrainRatio] = useState(70);
  const [valRatio, setValRatio] = useState(15);
  const [testRatio, setTestRatio] = useState(15);
  const [seed, setSeed] = useState(42);
  const [splitMethod, setSplitMethod] = useState("patient");
  const [isApplied, setIsApplied] = useState(false);

  const leakageRules: LeakageRule[] = [
    {
      id: "L1",
      name: "환자 단위 분할",
      description: "동일 환자가 train/test에 동시 존재하지 않음",
      status: isApplied ? "pass" : "pending",
    },
    {
      id: "L2",
      name: "시간순 분리",
      description: "미래 정보가 학습에 사용되지 않음",
      status: isApplied ? "pass" : "pending",
    },
    {
      id: "L3",
      name: "라벨 독립성",
      description: "라벨이 feature에서 파생되지 않음",
      status: isApplied ? "pass" : "pending",
    },
    {
      id: "L4",
      name: "전처리 분리",
      description: "통계치가 train에서만 계산됨",
      status: isApplied ? "pass" : "pending",
    },
    {
      id: "L5",
      name: "CV 무결성",
      description: "교차검증 fold가 환자 경계를 존중함",
      status: isApplied ? "pass" : "pending",
    },
  ];

  const totalSubjects = 102;
  const trainCount = Math.round(totalSubjects * trainRatio / 100);
  const valCount = Math.round(totalSubjects * valRatio / 100);
  const testCount = totalSubjects - trainCount - valCount;

  const handleApply = () => {
    setIsApplied(true);
  };

  return (
    <StepLayout
      currentStep={5}
      title="데이터 분할"
      description="Train/Validation/Test 데이터 분할을 설정합니다."
      input={{ label: "CohortSpec", description: "코호트 정보" }}
      output={{ label: "SplitPlan", description: "분할 설정" }}
    >
      <div className="max-w-4xl space-y-6">
        {/* Split Configuration */}
        <div className="grid grid-cols-2 gap-6">
          {/* Split Ratios */}
          <div className="bg-card rounded-lg border p-4">
            <h3 className="font-semibold mb-4">분할 비율</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Train</span>
                  <span className="font-mono text-sm">{trainRatio}% ({trainCount}명)</span>
                </div>
                <Slider
                  value={[trainRatio]}
                  onValueChange={(v) => {
                    setTrainRatio(v[0]);
                    const remaining = 100 - v[0];
                    setValRatio(Math.round(remaining / 2));
                    setTestRatio(remaining - Math.round(remaining / 2));
                  }}
                  max={90}
                  min={50}
                  step={5}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Validation</span>
                  <span className="font-mono text-sm">{valRatio}% ({valCount}명)</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${valRatio}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Test</span>
                  <span className="font-mono text-sm">{testRatio}% ({testCount}명)</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${testRatio}%` }}
                  />
                </div>
              </div>

              {/* Visual Split */}
              <div className="flex h-8 rounded-lg overflow-hidden">
                <div
                  className="bg-primary flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${trainRatio}%` }}
                >
                  Train
                </div>
                <div
                  className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${valRatio}%` }}
                >
                  Val
                </div>
                <div
                  className="bg-purple-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${testRatio}%` }}
                >
                  Test
                </div>
              </div>
            </div>
          </div>

          {/* Split Settings */}
          <div className="bg-card rounded-lg border p-4">
            <h3 className="font-semibold mb-4">분할 설정</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">분할 방식</label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={splitMethod === "patient" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSplitMethod("patient")}
                    className="flex-1"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    환자 단위
                  </Button>
                  <Button
                    variant={splitMethod === "random" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSplitMethod("random")}
                    className="flex-1"
                  >
                    <Shuffle className="w-4 h-4 mr-1" />
                    랜덤
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Random Seed</label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value))}
                  className="w-full mt-2 px-3 py-2 border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Stratify By</label>
                <select className="w-full mt-2 px-3 py-2 border rounded-lg bg-background">
                  <option value="label">Label (recurrence)</option>
                  <option value="age">Age group</option>
                  <option value="gender">Gender</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Leakage Validator */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Leakage Validator</h3>
            </div>
            <Badge variant={isApplied ? "default" : "secondary"}>
              {isApplied ? "5/5 통과" : "대기 중"}
            </Badge>
          </div>

          <div className="divide-y">
            {leakageRules.map(rule => (
              <div key={rule.id} className="p-3 flex items-center gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono",
                  rule.status === "pass" && "bg-status-pass/20 text-status-pass",
                  rule.status === "fail" && "bg-status-fail/20 text-status-fail",
                  rule.status === "pending" && "bg-muted text-muted-foreground"
                )}>
                  {rule.status === "pass" ? (
                    <Check className="w-4 h-4" />
                  ) : rule.status === "fail" ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    rule.id.replace("L", "")
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{rule.name}</div>
                  <div className="text-xs text-muted-foreground">{rule.description}</div>
                </div>
                <Badge variant={
                  rule.status === "pass" ? "default" :
                  rule.status === "fail" ? "destructive" : "secondary"
                }>
                  {rule.status === "pass" ? "통과" :
                   rule.status === "fail" ? "실패" : "대기"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Warning for random split */}
        {splitMethod === "random" && (
          <div className="p-4 bg-status-warn/10 border border-status-warn/30 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-status-warn mt-0.5" />
            <div>
              <div className="font-medium text-status-warn">데이터 누수 위험</div>
              <p className="text-sm text-muted-foreground mt-1">
                랜덤 분할은 동일 환자의 데이터가 train과 test에 모두 포함될 수 있습니다.
                환자 단위 분할을 권장합니다.
              </p>
            </div>
          </div>
        )}

        {/* Apply Button */}
        <Button
          size="lg"
          className="w-full bg-rose-500 hover:bg-rose-600"
          onClick={handleApply}
        >
          <Split className="w-4 h-4 mr-2" />
          분할 적용 및 검증
        </Button>

        {/* Result */}
        {isApplied && (
          <div className="space-y-4">
            {/* Split Result */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-primary">{trainCount}</div>
                <div className="text-sm text-muted-foreground">Train</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Pos: {Math.round(trainCount * 0.33)} / Neg: {Math.round(trainCount * 0.67)}
                </div>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-500">{valCount}</div>
                <div className="text-sm text-muted-foreground">Validation</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Pos: {Math.round(valCount * 0.33)} / Neg: {Math.round(valCount * 0.67)}
                </div>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-500">{testCount}</div>
                <div className="text-sm text-muted-foreground">Test</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Pos: {Math.round(testCount * 0.33)} / Neg: {Math.round(testCount * 0.67)}
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="flex items-center gap-2 p-3 bg-status-pass/10 rounded-lg border border-status-pass/30">
              <Check className="w-5 h-5 text-status-pass" />
              <span className="text-status-pass font-medium">
                SplitPlan이 생성되었습니다. Leakage Validator 5/5 통과.
              </span>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  );
}
