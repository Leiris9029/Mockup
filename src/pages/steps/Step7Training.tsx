import { useState, useEffect } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Cpu,
  Check,
  Play,
  Pause,
  Square,
  Loader2,
  TrendingUp,
  Clock,
  Zap,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainingLog {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  valAuc: number;
}

export default function Step7Training() {
  const [isTraining, setIsTraining] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([]);

  const totalEpochs = 50;

  // Model config
  const [modelConfig] = useState({
    architecture: "CNN-LSTM",
    inputShape: "[19, 7680]",
    optimizer: "AdamW",
    learningRate: "1e-4",
    batchSize: 32,
    earlyStoppingPatience: 10,
  });

  const handleStart = () => {
    setIsTraining(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsTraining(false);
    setIsPaused(false);
  };

  // Simulate training progress
  useEffect(() => {
    if (!isTraining || isPaused || currentEpoch >= totalEpochs) return;

    const interval = setInterval(() => {
      setCurrentEpoch(prev => {
        const next = prev + 1;
        const newLog: TrainingLog = {
          epoch: next,
          trainLoss: 0.8 - (next * 0.012) + Math.random() * 0.05,
          valLoss: 0.85 - (next * 0.010) + Math.random() * 0.08,
          valAuc: 0.65 + (next * 0.004) + Math.random() * 0.02,
        };
        setTrainingLogs(logs => [...logs, newLog]);
        return next;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isTraining, isPaused, currentEpoch]);

  const isComplete = currentEpoch >= totalEpochs;
  const bestEpoch = trainingLogs.reduce((best, log) =>
    log.valAuc > (best?.valAuc || 0) ? log : best
  , trainingLogs[0]);

  return (
    <StepLayout
      currentStep={7}
      title="모델 학습"
      description="딥러닝 모델을 학습합니다."
      input={{ label: "Processed Features", description: "전처리된 데이터" }}
      output={{ label: "Model Checkpoint", description: "학습된 모델" }}
    >
      <div className="max-w-5xl space-y-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Model Config */}
          <div className="col-span-1 space-y-4">
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-semibold mb-4">모델 설정</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Architecture</span>
                  <span className="font-mono">{modelConfig.architecture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Input Shape</span>
                  <span className="font-mono">{modelConfig.inputShape}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Optimizer</span>
                  <span className="font-mono">{modelConfig.optimizer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Learning Rate</span>
                  <span className="font-mono">{modelConfig.learningRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batch Size</span>
                  <span className="font-mono">{modelConfig.batchSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Early Stopping</span>
                  <span className="font-mono">{modelConfig.earlyStoppingPatience} epochs</span>
                </div>
              </div>
            </div>

            {/* Resource Monitor */}
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-semibold mb-4">리소스 모니터</h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" /> GPU
                    </span>
                    <span className="font-mono">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" /> CPU
                    </span>
                    <span className="font-mono">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory</span>
                    <span className="font-mono">12.4 / 24 GB</span>
                  </div>
                  <Progress value={52} className="h-2" />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" /> Elapsed
                  </div>
                  <div className="font-mono">{Math.floor(currentEpoch * 0.5)}m {(currentEpoch * 30) % 60}s</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                    <DollarSign className="w-3 h-3" /> Cost
                  </div>
                  <div className="font-mono">${(currentEpoch * 0.08).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Training Progress */}
          <div className="col-span-2 space-y-4">
            {/* Progress Header */}
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">학습 진행</h3>
                  <p className="text-sm text-muted-foreground">
                    Epoch {currentEpoch} / {totalEpochs}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!isTraining ? (
                    <Button onClick={handleStart} className="bg-rose-500 hover:bg-rose-600">
                      <Play className="w-4 h-4 mr-2" />
                      학습 시작
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handlePause}>
                        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      </Button>
                      <Button variant="destructive" onClick={handleStop}>
                        <Square className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Progress value={(currentEpoch / totalEpochs) * 100} className="h-3" />

              {isTraining && !isPaused && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  학습 중...
                </div>
              )}
            </div>

            {/* Training Curves */}
            <div className="bg-card rounded-lg border p-4">
              <h4 className="font-semibold mb-4">학습 곡선</h4>

              <div className="h-48 flex items-end gap-1">
                {trainingLogs.slice(-30).map((log, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-1">
                    <div
                      className="bg-primary/60 rounded-t"
                      style={{ height: `${(1 - log.trainLoss) * 100}%` }}
                      title={`Train Loss: ${log.trainLoss.toFixed(4)}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary/60 rounded" />
                  <span>Train Loss</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500/60 rounded" />
                  <span>Val Loss</span>
                </div>
              </div>
            </div>

            {/* Current Metrics */}
            {trainingLogs.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-card rounded-lg border p-3 text-center">
                  <div className="text-xl font-bold">
                    {trainingLogs[trainingLogs.length - 1]?.trainLoss.toFixed(4)}
                  </div>
                  <div className="text-xs text-muted-foreground">Train Loss</div>
                </div>
                <div className="bg-card rounded-lg border p-3 text-center">
                  <div className="text-xl font-bold">
                    {trainingLogs[trainingLogs.length - 1]?.valLoss.toFixed(4)}
                  </div>
                  <div className="text-xs text-muted-foreground">Val Loss</div>
                </div>
                <div className="bg-card rounded-lg border p-3 text-center">
                  <div className="text-xl font-bold text-primary">
                    {trainingLogs[trainingLogs.length - 1]?.valAuc.toFixed(4)}
                  </div>
                  <div className="text-xs text-muted-foreground">Val AUC</div>
                </div>
                <div className="bg-card rounded-lg border p-3 text-center">
                  <div className="text-xl font-bold text-status-pass">
                    {bestEpoch?.valAuc.toFixed(4) || "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">Best AUC (E{bestEpoch?.epoch || 0})</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Completion */}
        {isComplete && (
          <div className="space-y-4">
            <div className="bg-card rounded-lg border p-4">
              <h4 className="font-semibold mb-3">최종 결과</h4>
              <div className="grid grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-status-pass">{bestEpoch?.valAuc.toFixed(4)}</div>
                  <div className="text-xs text-muted-foreground">Best Val AUC</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{bestEpoch?.epoch}</div>
                  <div className="text-xs text-muted-foreground">Best Epoch</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalEpochs}</div>
                  <div className="text-xs text-muted-foreground">Total Epochs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{Math.floor(totalEpochs * 0.5)}m</div>
                  <div className="text-xs text-muted-foreground">Training Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">${(totalEpochs * 0.08).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Compute Cost</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-status-pass/10 rounded-lg border border-status-pass/30">
              <Check className="w-5 h-5 text-status-pass" />
              <span className="text-status-pass font-medium">
                모델 학습이 완료되었습니다. 체크포인트가 저장되었습니다.
              </span>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  );
}
