import { useMemo } from "react";
import { cn } from "@/lib/utils";

// Generate calibration data
function generateCalibrationData(seed: number): { predicted: number; observed: number; count: number }[] {
  const bins = 10;
  const data: { predicted: number; observed: number; count: number }[] = [];

  for (let i = 0; i < bins; i++) {
    const predicted = (i + 0.5) / bins;
    // Well-calibrated model with slight under/over confidence
    const noise = Math.sin(seed + i) * 0.08;
    const bias = predicted > 0.5 ? 0.03 : -0.02; // Slight overconfidence at high probabilities
    const observed = Math.max(0, Math.min(1, predicted + noise + bias));
    const count = Math.floor(50 + Math.random() * 100); // Sample count per bin

    data.push({ predicted, observed, count });
  }

  return data;
}

// Reliability diagram point
interface ReliabilityPoint {
  x: number;
  y: number;
}

export function CalibrationCurve() {
  const data = useMemo(() => generateCalibrationData(42), []);

  // Calculate ECE (Expected Calibration Error)
  const totalSamples = data.reduce((sum, d) => sum + d.count, 0);
  const ece = data.reduce((sum, d) => {
    return sum + (d.count / totalSamples) * Math.abs(d.predicted - d.observed);
  }, 0);

  // Calculate MCE (Maximum Calibration Error)
  const mce = Math.max(...data.map((d) => Math.abs(d.predicted - d.observed)));

  // Histogram data for prediction distribution
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* Reliability Diagram */}
        <div className="flex-1 bg-card rounded-lg border p-4">
          <h4 className="font-medium mb-4">Reliability Diagram</h4>

          <div className="relative">
            {/* Y-axis label */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground whitespace-nowrap">
              Fraction of Positives
            </div>

            <div className="ml-8">
              <svg viewBox="0 0 220 220" className="w-full max-w-[300px] mx-auto">
                {/* Grid */}
                {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                  <g key={v}>
                    <line
                      x1="20"
                      y1={200 - v * 180}
                      x2="200"
                      y2={200 - v * 180}
                      stroke="currentColor"
                      strokeOpacity="0.1"
                    />
                    <line
                      x1={20 + v * 180}
                      y1="20"
                      x2={20 + v * 180}
                      y2="200"
                      stroke="currentColor"
                      strokeOpacity="0.1"
                    />
                    <text x="15" y={205 - v * 180} textAnchor="end" className="text-[10px] fill-muted-foreground">
                      {v.toFixed(1)}
                    </text>
                    <text x={20 + v * 180} y="215" textAnchor="middle" className="text-[10px] fill-muted-foreground">
                      {v.toFixed(1)}
                    </text>
                  </g>
                ))}

                {/* Perfect calibration line */}
                <line
                  x1="20"
                  y1="200"
                  x2="200"
                  y2="20"
                  stroke="#6b7280"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />

                {/* Calibration bars */}
                {data.map((d, i) => {
                  const x = 20 + d.predicted * 180 - 8;
                  const barHeight = d.observed * 180;
                  return (
                    <g key={i}>
                      {/* Bar */}
                      <rect
                        x={x}
                        y={200 - barHeight}
                        width="16"
                        height={barHeight}
                        fill="#3b82f6"
                        opacity="0.7"
                      />
                      {/* Gap indicator */}
                      {Math.abs(d.predicted - d.observed) > 0.05 && (
                        <line
                          x1={x + 8}
                          y1={200 - d.predicted * 180}
                          x2={x + 8}
                          y2={200 - d.observed * 180}
                          stroke="#ef4444"
                          strokeWidth="2"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Confidence interval (shaded area) */}
                <path
                  d={`M 20 200 ${data.map((d) => `L ${20 + d.predicted * 180} ${200 - (d.observed + 0.05) * 180}`).join(" ")} L 200 20 L 200 20 ${data.map((d) => `L ${20 + d.predicted * 180} ${200 - (d.observed - 0.05) * 180}`).reverse().join(" ")} Z`}
                  fill="#3b82f6"
                  opacity="0.1"
                />
              </svg>

              <div className="text-center text-xs text-muted-foreground mt-2">
                Mean Predicted Probability
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Distribution */}
        <div className="w-64 bg-card rounded-lg border p-4">
          <h4 className="font-medium mb-4">Prediction Distribution</h4>

          <div className="space-y-1">
            {data.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-12 text-right font-mono">
                  {(d.predicted - 0.05).toFixed(1)}-{(d.predicted + 0.05).toFixed(1)}
                </span>
                <div className="flex-1 h-4 bg-muted/30 rounded overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded"
                    style={{ width: `${(d.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground w-8 font-mono">
                  {d.count}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t text-center">
            <div className="text-sm text-muted-foreground">Total Samples</div>
            <div className="text-2xl font-bold">{totalSamples}</div>
          </div>
        </div>
      </div>

      {/* Calibration Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border p-4 text-center">
          <div className="text-3xl font-bold text-status-pass">{ece.toFixed(3)}</div>
          <div className="text-sm text-muted-foreground">ECE</div>
          <div className="text-xs text-muted-foreground mt-1">Expected Calibration Error</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <div className="text-3xl font-bold">{mce.toFixed(3)}</div>
          <div className="text-sm text-muted-foreground">MCE</div>
          <div className="text-xs text-muted-foreground mt-1">Maximum Calibration Error</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <div className="text-3xl font-bold">0.847</div>
          <div className="text-sm text-muted-foreground">Brier Score</div>
          <div className="text-xs text-muted-foreground mt-1">Lower is better</div>
        </div>
        <div className="bg-card rounded-lg border p-4 text-center">
          <div className={cn(
            "text-3xl font-bold",
            ece < 0.05 ? "text-status-pass" : ece < 0.1 ? "text-status-warn" : "text-status-fail"
          )}>
            {ece < 0.05 ? "Well" : ece < 0.1 ? "Fair" : "Poor"}
          </div>
          <div className="text-sm text-muted-foreground">Calibration</div>
          <div className="text-xs text-muted-foreground mt-1">
            {ece < 0.05 ? "Model is well-calibrated" : ece < 0.1 ? "Consider recalibration" : "Recalibration needed"}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-muted-foreground" style={{ borderTop: "2px dashed" }} />
          <span className="text-muted-foreground">Perfect calibration</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-3 bg-primary/70 rounded" />
          <span className="text-muted-foreground">Model calibration</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-status-fail" />
          <span className="text-muted-foreground">Calibration gap</span>
        </div>
      </div>
    </div>
  );
}
