import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const channels = ["Fp1", "Fp2", "F3", "F4", "C3", "C4", "P3", "P4", "O1", "O2"];

// Generate coherence matrix (symmetric)
function generateCoherenceMatrix(seed: number): number[][] {
  const n = channels.length;
  const matrix: number[][] = [];

  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1; // Self-coherence is 1
      } else if (i > j) {
        matrix[i][j] = matrix[j][i]; // Symmetric
      } else {
        // Generate realistic coherence values
        // Nearby channels have higher coherence
        const distance = Math.abs(i - j);
        const baseCoherence = 0.8 - distance * 0.08;

        // Same hemisphere bonus
        const sameHemisphere = (i % 2) === (j % 2);
        const hemisphereBonus = sameHemisphere ? 0.1 : 0;

        // Add some randomness
        const noise = Math.sin(seed + i * 10 + j) * 0.15;

        matrix[i][j] = Math.max(0.1, Math.min(0.95, baseCoherence + hemisphereBonus + noise));
      }
    }
  }

  return matrix;
}

// Color scale for coherence values
function getCoherenceColor(value: number): string {
  // Blue (low) -> White (mid) -> Red (high)
  if (value < 0.5) {
    const intensity = Math.round((1 - value * 2) * 255);
    return `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
  } else {
    const intensity = Math.round((value - 0.5) * 2 * 255);
    return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
  }
}

export function ConnectivityMatrix() {
  const [band, setBand] = useState("alpha");
  const [metric, setMetric] = useState("coherence");

  const matrix = generateCoherenceMatrix(band === "alpha" ? 42 : band === "theta" ? 24 : 66);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Functional Connectivity</h4>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Band:</span>
            <Select value={band} onValueChange={setBand}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delta">Delta</SelectItem>
                <SelectItem value="theta">Theta</SelectItem>
                <SelectItem value="alpha">Alpha</SelectItem>
                <SelectItem value="beta">Beta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Metric:</span>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coherence">Coherence</SelectItem>
                <SelectItem value="plv">PLV</SelectItem>
                <SelectItem value="wpli">wPLI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Matrix */}
        <div className="flex-1">
          <div className="bg-card rounded-lg border p-4">
            {/* Column headers */}
            <div className="flex ml-12 mb-1">
              {channels.map((ch) => (
                <div
                  key={ch}
                  className="w-10 text-center text-[10px] text-muted-foreground font-mono"
                >
                  {ch}
                </div>
              ))}
            </div>

            {/* Matrix rows */}
            {channels.map((rowCh, i) => (
              <div key={rowCh} className="flex items-center">
                {/* Row header */}
                <div className="w-12 text-right pr-2 text-[10px] text-muted-foreground font-mono">
                  {rowCh}
                </div>

                {/* Cells */}
                {channels.map((colCh, j) => (
                  <div
                    key={colCh}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center text-[9px] font-mono border border-background/50",
                      i === j && "bg-muted"
                    )}
                    style={{
                      backgroundColor: i === j ? undefined : getCoherenceColor(matrix[i][j]),
                      color: matrix[i][j] > 0.6 ? "white" : "black",
                    }}
                    title={`${rowCh} ↔ ${colCh}: ${matrix[i][j].toFixed(2)}`}
                  >
                    {i === j ? "-" : matrix[i][j].toFixed(2)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Color scale legend */}
        <div className="w-20">
          <div className="text-xs text-muted-foreground mb-2 text-center">
            {metric === "coherence" ? "Coherence" : metric.toUpperCase()}
          </div>
          <div className="h-64 w-6 mx-auto rounded overflow-hidden border">
            <div
              className="h-full w-full"
              style={{
                background: "linear-gradient(to bottom, rgb(255,0,0), rgb(255,255,255), rgb(0,0,255))",
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0</span>
            <span>1</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 text-center">
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="text-lg font-bold">0.72</div>
          <div className="text-xs text-muted-foreground">Global Efficiency</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="text-lg font-bold">0.58</div>
          <div className="text-xs text-muted-foreground">Clustering Coeff.</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="text-lg font-bold">2.3</div>
          <div className="text-xs text-muted-foreground">Avg Path Length</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-3">
          <div className="text-lg font-bold">0.84</div>
          <div className="text-xs text-muted-foreground">Small-worldness</div>
        </div>
      </div>
    </div>
  );
}
