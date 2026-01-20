import { useMemo } from 'react';

interface AttributionHeatmapProps {
  channels: string[];
  timePoints: number;
  frequencies: string[];
}

export function AttributionHeatmap({
  channels = ['Fp1', 'Fp2', 'F3', 'F4', 'C3', 'C4', 'P3', 'P4', 'O1', 'O2', 'F7', 'F8', 'T3', 'T4', 'T5', 'T6', 'Fz', 'Cz', 'Pz'],
  timePoints = 30,
  frequencies = ['Delta', 'Theta', 'Alpha', 'Sigma', 'Beta'],
}: AttributionHeatmapProps) {
  // Generate random attribution values
  const data = useMemo(() => {
    return channels.map((channel) => ({
      channel,
      values: frequencies.map((freq) => ({
        freq,
        value: Math.random() * 2 - 1, // -1 to 1
      })),
    }));
  }, [channels, frequencies]);

  // Color scale function
  const getColor = (value: number) => {
    if (value > 0) {
      const intensity = Math.min(value, 1);
      return `rgba(34, 197, 94, ${intensity})`; // Green for positive
    } else {
      const intensity = Math.min(Math.abs(value), 1);
      return `rgba(239, 68, 68, ${intensity})`; // Red for negative
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header - Frequencies */}
        <div className="flex mb-2">
          <div className="w-16 shrink-0" />
          {frequencies.map((freq) => (
            <div
              key={freq}
              className="flex-1 text-center text-xs font-medium text-muted-foreground"
            >
              {freq}
            </div>
          ))}
        </div>

        {/* Heatmap rows */}
        <div className="space-y-0.5">
          {data.map((row) => (
            <div key={row.channel} className="flex items-center">
              <div className="w-16 shrink-0 text-xs font-mono text-muted-foreground pr-2 text-right">
                {row.channel}
              </div>
              {row.values.map((cell, idx) => (
                <div
                  key={idx}
                  className="flex-1 h-6 mx-0.5 rounded-sm transition-all hover:ring-2 hover:ring-primary/50"
                  style={{ backgroundColor: getColor(cell.value) }}
                  title={`${row.channel} - ${cell.freq}: ${cell.value.toFixed(3)}`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Color legend */}
        <div className="flex items-center justify-center mt-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-xs text-muted-foreground">Negative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-300" />
            <span className="text-xs text-muted-foreground">Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-xs text-muted-foreground">Positive</span>
          </div>
        </div>
      </div>
    </div>
  );
}
