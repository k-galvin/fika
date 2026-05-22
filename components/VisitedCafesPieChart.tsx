import React, { useState, useEffect } from "react";
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
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In test environment (JSDOM), dimensions are always 0
    if (process.env.NODE_ENV === 'test') {
      setDimensions({ width: 400, height: 256 });
      return;
    }

    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

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
      <div 
        ref={containerRef} 
        className="h-64 w-full min-h-[256px] flex items-center justify-center overflow-hidden"
      >
        {dimensions ? (
          <ResponsiveContainer width={dimensions.width} height={dimensions.height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="value"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label={({ name, percent, x, y, cx }: any) => (
                  <text
                    x={x}
                    y={y}
                    fill="currentColor"
                    textAnchor={x > cx ? "start" : "end"}
                    dominantBaseline="central"
                    style={{
                      fontFamily: "var(--font-kate)",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {`${name} (${(((percent || 0) as number) * 100).toFixed(0)}%)`}
                  </text>
                )}
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
                  backgroundColor: 'hsl(var(--background))',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="size-8 rounded-full border-2 border-primary/10 border-t-primary/40 animate-spin" />
        )}
      </div>
    </div>
  );
};

export default VisitedCafesPieChart;
