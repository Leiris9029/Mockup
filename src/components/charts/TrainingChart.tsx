import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
}

interface TrainingChartProps {
  data: TrainingMetrics[];
  type: 'loss' | 'accuracy';
  height?: number;
}

export function TrainingChart({ data, type, height = 200 }: TrainingChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        No training data yet
      </div>
    );
  }

  const isLoss = type === 'loss';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="epoch"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          domain={isLoss ? [0, 'auto'] : [0, 1]}
          tickFormatter={(value) => isLoss ? value.toFixed(2) : `${(value * 100).toFixed(0)}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value: number) =>
            isLoss ? value.toFixed(4) : `${(value * 100).toFixed(1)}%`
          }
        />
        <Legend />
        {isLoss ? (
          <>
            <Line
              type="monotone"
              dataKey="loss"
              name="Train Loss"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="valLoss"
              name="Val Loss"
              stroke="hsl(var(--status-warn))"
              strokeWidth={2}
              dot={false}
            />
          </>
        ) : (
          <>
            <Line
              type="monotone"
              dataKey="accuracy"
              name="Train Accuracy"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="valAccuracy"
              name="Val Accuracy"
              stroke="hsl(var(--status-pass))"
              strokeWidth={2}
              dot={false}
            />
          </>
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
