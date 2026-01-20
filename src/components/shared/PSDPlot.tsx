import { useMemo } from "react";
import { cn } from "@/lib/utils";

// Frequency bands
const bands = [
  { name: "Delta", range: "0.5-4 Hz", color: "#8b5cf6" },
  { name: "Theta", range: "4-8 Hz", color: "#3b82f6" },
  { name: "Alpha", range: "8-13 Hz", color: "#22c55e" },
  { name: "Beta", range: "13-30 Hz", color: "#f59e0b" },
  { name: "Gamma", range: "30-100 Hz", color: "#ef4444" },
];

// Generate realistic PSD curve
function generatePSDCurve(seed: number): string {
  const points: string[] = [];
  const width = 600;
  const height = 200;

  for (let x = 0; x < width; x++) {
    const freq = (x / width) * 50; // 0-50 Hz

    // 1/f noise baseline
    const baseline = 80 / (freq + 1);

    // Alpha peak (around 10 Hz)
    const alphaPeak = 40 * Math.exp(-Math.pow(freq - 10, 2) / 8);

    // Theta activity
    const thetaPeak = 20 * Math.exp(-Math.pow(freq - 6, 2) / 4);

    // Delta dominance at low frequencies
    const deltaPeak = 30 * Math.exp(-Math.pow(freq - 2, 2) / 3);

    // Beta activity
    const betaPeak = 10 * Math.exp(-Math.pow(freq - 20, 2) / 20);

    // Combine
    let power = baseline + alphaPeak + thetaPeak + deltaPeak + betaPeak;

    // Add some noise
    const noise = (Math.sin(seed + x * 0.5) * 0.5 + 0.5) * 5;
    power += noise;

    // Convert to log scale (dB) and map to y
    const logPower = Math.log10(power + 1) * 50;
    const y = height - Math.min(height - 10, Math.max(10, logPower));

    points.push(`${x},${y}`);
  }

  return points.join(" ");
}

// Band power bars data
const bandPowers = [
  { band: "Delta", power: 42, change: +5.2 },
  { band: "Theta", power: 28, change: +2.1 },
  { band: "Alpha", power: 65, change: -3.4 },
  { band: "Beta", power: 35, change: +1.8 },
  { band: "Gamma", power: 15, change: -0.5 },
];

export function PSDPlot() {
  const curve = useMemo(() => generatePSDCurve(42), []);

  return (
    <div className="space-y-6">
      {/* Main PSD Plot */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Power Spectral Density (Welch Method)</h4>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Window: 4s</span>
            <span>Overlap: 50%</span>
            <span>nfft: 1024</span>
          </div>
        </div>

        <div className="relative">
          {/* Y-axis label */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground whitespace-nowrap">
            Power (dB/Hz)
          </div>

          {/* Plot area */}
          <div className="ml-8">
            <svg viewBox="0 0 600 220" className="w-full h-[220px]">
              {/* Grid lines */}
              {[0, 50, 100, 150, 200].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                />
              ))}
              {[0, 120, 240, 360, 480, 600].map((x) => (
                <line
                  key={x}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="200"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                />
              ))}

              {/* Frequency band regions */}
              <rect x="6" y="0" width="42" height="200" fill="#8b5cf6" fillOpacity="0.1" />
              <rect x="48" y="0" width="48" height="200" fill="#3b82f6" fillOpacity="0.1" />
              <rect x="96" y="0" width="60" height="200" fill="#22c55e" fillOpacity="0.15" />
              <rect x="156" y="0" width="204" height="200" fill="#f59e0b" fillOpacity="0.1" />

              {/* PSD curve */}
              <polyline
                points={curve}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />

              {/* Confidence interval (shaded area) */}
              <polyline
                points={curve}
                fill="url(#psdGradient)"
                fillOpacity="0.3"
                stroke="none"
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="psdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* X-axis labels */}
              {[0, 10, 20, 30, 40, 50].map((freq) => (
                <text
                  key={freq}
                  x={(freq / 50) * 600}
                  y="215"
                  textAnchor="middle"
                  className="text-[10px] fill-muted-foreground"
                >
                  {freq}
                </text>
              ))}
            </svg>

            {/* X-axis label */}
            <div className="text-center text-xs text-muted-foreground mt-1">
              Frequency (Hz)
            </div>
          </div>
        </div>
      </div>

      {/* Band Powers */}
      <div className="grid grid-cols-5 gap-4">
        {bandPowers.map((item, idx) => (
          <div key={item.band} className="bg-card rounded-lg border p-3">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: bands[idx].color }}
              />
              <span className="text-sm font-medium">{item.band}</span>
            </div>
            <div className="text-2xl font-bold">{item.power}%</div>
            <div
              className={cn(
                "text-xs",
                item.change > 0 ? "text-status-pass" : "text-status-fail"
              )}
            >
              {item.change > 0 ? "+" : ""}
              {item.change}% vs baseline
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        {bands.map((band) => (
          <div key={band.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: band.color, opacity: 0.3 }}
            />
            <span className="text-muted-foreground">
              {band.name} ({band.range})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
