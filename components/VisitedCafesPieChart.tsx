import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PieChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface VisitedCafesPieChartProps {
  data: PieChartData[];
  title: string;
}

const COLORS = [
  "hsl(25 40% 20%)",   /* Coffee */
  "hsl(140 20% 30%)",  /* Matcha */
  "hsl(35 30% 60%)",   /* Roasted Bean */
  "hsl(25 30% 45%)",   /* Espresso */
  "hsl(160 15% 40%)",  /* Mint Leaf */
  "hsl(35 40% 80%)",   /* Latte Foam */
];

const VisitedCafesPieChart: React.FC<VisitedCafesPieChartProps> = ({
  data,
  title,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-primary/40 font-kate italic py-10">
        No entries recorded for {title}.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="font-kate font-bold text-xl text-primary mb-4">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              dataKey="value"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label={({ name, percent }: any) =>
                `${name} (${(((percent || 0) as number) * 100).toFixed(0)}%)`
              }
              className="font-kate text-[10px]"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                fontFamily: 'var(--font-kate)', 
                borderRadius: '12px',
                border: '1.5px solid hsl(var(--primary) / 0.1)',
                backgroundColor: 'hsl(var(--background))'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VisitedCafesPieChart;
