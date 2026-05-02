import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieLabelRenderProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28DFF",
  "#FF69B4",
  "#8A2BE2",
  "#00CED1",
  "#FFD700",
  "#ADFF2F",
];

const VisitedCafesPieChart: React.FC<VisitedCafesPieChartProps> = ({
  data,
  title,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No data available for {title}.
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">{title} Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={70}
              fill="#8884d8"
              dataKey="value"
              label={({ percent }: PieLabelRenderProps) =>
                `${(((percent || 0) as number) * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default VisitedCafesPieChart;
