import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface CalibrationPoint {
  predicted: number;
  observed: number;
}

interface CalibrationChartProps {
  data: CalibrationPoint[];
}

export function CalibrationChart({ data }: CalibrationChartProps) {
  // Generate perfect calibration line points
  const perfectLine = [
    { predicted: 0, observed: 0 },
    { predicted: 1, observed: 1 },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          type="number"
          dataKey="predicted"
          name="Predicted"
          domain={[0, 1]}
          tickCount={6}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          label={{
            value: 'Predicted Probability',
            position: 'insideBottom',
            offset: -10,
            fontSize: 12,
            fill: 'hsl(var(--muted-foreground))',
          }}
        />
        <YAxis
          type="number"
          dataKey="observed"
          name="Observed"
          domain={[0, 1]}
          tickCount={6}
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          label={{
            value: 'Observed Frequency',
            angle: -90,
            position: 'insideLeft',
            fontSize: 12,
            fill: 'hsl(var(--muted-foreground))',
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value: number) => value.toFixed(3)}
        />
        {/* Perfect calibration line */}
        <ReferenceLine
          segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]}
          stroke="hsl(var(--muted-foreground))"
          strokeDasharray="5 5"
          strokeWidth={1}
        />
        {/* Actual calibration points */}
        <Scatter
          name="Calibration"
          data={data}
          fill="hsl(var(--primary))"
          line={{ stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// Generate mock calibration data
export function generateCalibrationData(): CalibrationPoint[] {
  const bins = 10;
  const data: CalibrationPoint[] = [];

  for (let i = 0; i < bins; i++) {
    const predicted = (i + 0.5) / bins;
    // Add some realistic deviation from perfect calibration
    const noise = (Math.random() - 0.5) * 0.1;
    const observed = Math.max(0, Math.min(1, predicted + noise));
    data.push({ predicted, observed });
  }

  return data;
}
