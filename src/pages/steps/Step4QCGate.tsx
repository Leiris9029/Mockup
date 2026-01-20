import { useState } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Check,
  X,
  AlertTriangle,
  Activity,
  Zap,
  Eye,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QCCheck {
  id: string;
  name: string;
  description: string;
  status: "pass" | "warn" | "fail" | "pending";
  value?: string;
  threshold?: string;
}

export default function Step4QCGate() {
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const qcChecks: QCCheck[] = [
    {
      id: "signal_quality",
      name: "신호 품질",
      description: "전체 채널의 SNR 검사",
      status: isComplete ? "pass" : "pending",
      value: "SNR 12.3 dB",
      threshold: "> 10 dB",
    },
    {
      id: "artifact_ratio",
      name: "아티팩트 비율",
      description: "눈 깜빡임, 근육 아티팩트 비율",
      status: isComplete ? "pass" : "pending",
      value: "18%",
      threshold: "< 30%",
    },
    {
      id: "channel_dropout",
      name: "채널 드롭아웃",
      description: "불량 채널 비율",
      status: isComplete ? "pass" : "pending",
      value: "2/19 채널",
      threshold: "< 20%",
    },
    {
      id: "recording_duration",
      name: "녹화 시간",
      description: "최소 녹화 시간 충족 여부",
      status: isComplete ? "warn" : "pending",
      value: "평균 7.2h",
      threshold: "> 4h",
    },
    {
      id: "sampling_consistency",
      name: "샘플링 일관성",
      description: "파일 간 샘플링 레이트 일치",
      status: isComplete ? "pass" : "pending",
      value: "256 Hz 일치",
      threshold: "100% 일치",
    },
    {
      id: "missing_data",
      name: "결측 데이터",
      description: "연속 결측 구간 검사",
      status: isComplete ? "pass" : "pending",
      value: "최대 2.3초",
      threshold: "< 30초",
    },
  ];

  const handleRunQC = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setIsComplete(true);
    }, 2000);
  };

  const passCount = qcChecks.filter(c => c.status === "pass").length;
  const warnCount = qcChecks.filter(c => c.status === "warn").length;
  const failCount = qcChecks.filter(c => c.status === "fail").length;

  return (
    <StepLayout
      currentStep={4}
      title="QC 검증"
      description="데이터 품질을 검증하고 문제점을 확인합니다."
      input={{ label: "DatasetManifest", description: "이전 단계" }}
      output={{ label: "QC Report", description: "품질 검증 결과" }}
    >
      <div className="max-w-4xl space-y-6">
        {/* QC Gate Status */}
        <div className={cn(
          "p-6 rounded-lg border-2",
          !isComplete && "bg-muted/30 border-dashed",
          isComplete && failCount === 0 && "bg-status-pass/5 border-status-pass/30",
          isComplete && failCount > 0 && "bg-status-fail/5 border-status-fail/30"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                !isComplete && "bg-muted",
                isComplete && failCount === 0 && "bg-status-pass/20",
                isComplete && failCount > 0 && "bg-status-fail/20"
              )}>
                {isRunning ? (
                  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                ) : isComplete ? (
                  failCount === 0 ? (
                    <Check className="w-8 h-8 text-status-pass" />
                  ) : (
                    <X className="w-8 h-8 text-status-fail" />
                  )
                ) : (
                  <Shield className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  {isRunning
                    ? "품질 검사 실행 중..."
                    : isComplete
                    ? failCount === 0
                      ? "QC Gate 통과"
                      : "QC Gate 실패"
                    : "QC 검사 대기"}
                </h3>
                <p className="text-muted-foreground">
                  {isComplete
                    ? `${passCount} 통과 / ${warnCount} 경고 / ${failCount} 실패`
                    : "버튼을 눌러 품질 검사를 시작하세요"}
                </p>
              </div>
            </div>

            {!isComplete && (
              <Button
                size="lg"
                onClick={handleRunQC}
                disabled={isRunning}
                className="bg-rose-500 hover:bg-rose-600"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    검사 중...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    QC 검사 실행
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* QC Checks */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b">
            <h4 className="font-semibold">품질 검사 항목</h4>
          </div>

          <div className="divide-y">
            {qcChecks.map(check => (
              <div
                key={check.id}
                className={cn(
                  "p-4 flex items-center gap-4",
                  check.status === "warn" && "bg-status-warn/5",
                  check.status === "fail" && "bg-status-fail/5"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  check.status === "pass" && "bg-status-pass/20",
                  check.status === "warn" && "bg-status-warn/20",
                  check.status === "fail" && "bg-status-fail/20",
                  check.status === "pending" && "bg-muted"
                )}>
                  {check.status === "pass" ? (
                    <Check className="w-5 h-5 text-status-pass" />
                  ) : check.status === "warn" ? (
                    <AlertTriangle className="w-5 h-5 text-status-warn" />
                  ) : check.status === "fail" ? (
                    <X className="w-5 h-5 text-status-fail" />
                  ) : (
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-medium">{check.name}</div>
                  <div className="text-sm text-muted-foreground">{check.description}</div>
                </div>

                {isComplete && (
                  <>
                    <div className="text-right">
                      <div className="font-mono text-sm">{check.value}</div>
                      <div className="text-xs text-muted-foreground">기준: {check.threshold}</div>
                    </div>

                    <Badge
                      variant={
                        check.status === "pass" ? "default" :
                        check.status === "warn" ? "secondary" : "destructive"
                      }
                      className={cn(
                        check.status === "pass" && "bg-status-pass",
                        check.status === "warn" && "bg-status-warn"
                      )}
                    >
                      {check.status === "pass" ? "통과" :
                       check.status === "warn" ? "경고" : "실패"}
                    </Badge>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {isComplete && warnCount > 0 && (
          <div className="bg-status-warn/5 border border-status-warn/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-status-warn mt-0.5" />
              <div>
                <h4 className="font-semibold text-status-warn">권장 조치</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• 녹화 시간이 짧은 파일들을 검토하세요 (6개 파일)</li>
                  <li>• 필요 시 해당 파일을 제외하거나 추가 데이터를 수집하세요</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Next Step */}
        {isComplete && failCount === 0 && (
          <div className="flex items-center gap-2 p-3 bg-status-pass/10 rounded-lg border border-status-pass/30">
            <Check className="w-5 h-5 text-status-pass" />
            <span className="text-status-pass font-medium">
              QC 검사가 완료되었습니다. 다음 단계로 진행하세요.
            </span>
          </div>
        )}
      </div>
    </StepLayout>
  );
}
