import { useState } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Check,
  Play,
  Loader2,
  Filter,
  Waves,
  Scissors,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PreprocessStep {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  config: Record<string, any>;
}

export default function Step6PreprocessRecipe() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [preprocessSteps, setPreprocessSteps] = useState<PreprocessStep[]>([
    {
      id: "filter",
      name: "밴드패스 필터",
      description: "주파수 대역 필터링",
      enabled: true,
      config: { lowcut: 0.5, highcut: 45 },
    },
    {
      id: "reref",
      name: "재참조",
      description: "채널 재참조 방식",
      enabled: true,
      config: { method: "average" },
    },
    {
      id: "artifact",
      name: "아티팩트 제거",
      description: "ICA 기반 아티팩트 제거",
      enabled: true,
      config: { method: "ica", n_components: 20 },
    },
    {
      id: "epoch",
      name: "에포킹",
      description: "시계열 분할",
      enabled: true,
      config: { duration: 30, overlap: 0.5 },
    },
    {
      id: "normalize",
      name: "정규화",
      description: "스케일 정규화",
      enabled: true,
      config: { method: "zscore" },
    },
  ]);

  const toggleStep = (id: string) => {
    setPreprocessSteps(prev =>
      prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    );
  };

  const handleRun = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 3000);
  };

  const getStepIcon = (id: string) => {
    switch (id) {
      case "filter": return Filter;
      case "reref": return Waves;
      case "artifact": return Scissors;
      case "epoch": return Layers;
      case "normalize": return Settings;
      default: return Settings;
    }
  };

  return (
    <StepLayout
      currentStep={6}
      title="전처리"
      description="EEG 데이터 전처리 파이프라인을 설정합니다."
      input={{ label: "Raw EEG", description: "원본 데이터" }}
      output={{ label: "Processed Features", description: "전처리된 특징" }}
    >
      <div className="max-w-4xl space-y-6">
        {/* Preprocess Pipeline */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">전처리 파이프라인</h3>
            <Badge variant="secondary">
              {preprocessSteps.filter(s => s.enabled).length}개 활성화
            </Badge>
          </div>

          <div className="divide-y">
            {preprocessSteps.map((step, index) => {
              const Icon = getStepIcon(step.id);
              return (
                <div key={step.id} className={cn(
                  "p-4",
                  !step.enabled && "bg-muted/30"
                )}>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                        step.enabled ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <Icon className={cn(
                        "w-5 h-5",
                        step.enabled ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{step.name}</div>
                          <div className="text-sm text-muted-foreground">{step.description}</div>
                        </div>
                        <Switch
                          checked={step.enabled}
                          onCheckedChange={() => toggleStep(step.id)}
                        />
                      </div>

                      {step.enabled && (
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                          {step.id === "filter" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-muted-foreground">Low Cutoff (Hz)</label>
                                <input
                                  type="number"
                                  value={step.config.lowcut}
                                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">High Cutoff (Hz)</label>
                                <input
                                  type="number"
                                  value={step.config.highcut}
                                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                />
                              </div>
                            </div>
                          )}
                          {step.id === "reref" && (
                            <div>
                              <label className="text-xs text-muted-foreground">Method</label>
                              <select className="w-full mt-1 px-2 py-1 border rounded text-sm bg-background">
                                <option value="average">Average Reference</option>
                                <option value="cz">Cz Reference</option>
                                <option value="bipolar">Bipolar</option>
                              </select>
                            </div>
                          )}
                          {step.id === "artifact" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-muted-foreground">Method</label>
                                <select className="w-full mt-1 px-2 py-1 border rounded text-sm bg-background">
                                  <option value="ica">ICA</option>
                                  <option value="threshold">Threshold</option>
                                  <option value="autoreject">Autoreject</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">N Components</label>
                                <input
                                  type="number"
                                  value={step.config.n_components}
                                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                />
                              </div>
                            </div>
                          )}
                          {step.id === "epoch" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-muted-foreground">Duration (sec)</label>
                                <input
                                  type="number"
                                  value={step.config.duration}
                                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Overlap</label>
                                <input
                                  type="number"
                                  value={step.config.overlap}
                                  step="0.1"
                                  className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                />
                              </div>
                            </div>
                          )}
                          {step.id === "normalize" && (
                            <div>
                              <label className="text-xs text-muted-foreground">Method</label>
                              <select className="w-full mt-1 px-2 py-1 border rounded text-sm bg-background">
                                <option value="zscore">Z-score</option>
                                <option value="minmax">Min-Max</option>
                                <option value="robust">Robust Scaler</option>
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recipe Summary */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium mb-2">PreprocessRecipe YAML</h4>
          <pre className="text-xs font-mono p-3 bg-background rounded border overflow-x-auto">
{`preprocess:
  filter:
    type: bandpass
    lowcut: 0.5
    highcut: 45
  reref:
    method: average
  artifact:
    method: ica
    n_components: 20
  epoch:
    duration: 30
    overlap: 0.5
  normalize:
    method: zscore`}
          </pre>
        </div>

        {/* Run Button */}
        <Button
          size="lg"
          className="w-full bg-rose-500 hover:bg-rose-600"
          onClick={handleRun}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              전처리 실행 중...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              전처리 실행
            </>
          )}
        </Button>

        {/* Result */}
        {isComplete && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-card rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">102</div>
                <div className="text-sm text-muted-foreground">처리된 파일</div>
              </div>
              <div className="bg-card rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">12,240</div>
                <div className="text-sm text-muted-foreground">에포크 수</div>
              </div>
              <div className="bg-card rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold">19 × 7680</div>
                <div className="text-sm text-muted-foreground">Feature Shape</div>
              </div>
              <div className="bg-card rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-status-pass">100%</div>
                <div className="text-sm text-muted-foreground">성공률</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-status-pass/10 rounded-lg border border-status-pass/30">
              <Check className="w-5 h-5 text-status-pass" />
              <span className="text-status-pass font-medium">
                전처리가 완료되었습니다. 다음 단계로 진행하세요.
              </span>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  );
}
