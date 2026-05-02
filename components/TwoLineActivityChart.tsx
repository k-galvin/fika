import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TwoLineActivityChartProps {
  data: Array<{
    time_period: string;
    daily_visit_count: number;
    daily_save_count: number;
  }>;
}

const TwoLineActivityChart: React.FC<TwoLineActivityChartProps> = ({
  data,
}) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />

        {/* X-Axis: Time Period (Date) */}
        <XAxis
          dataKey="time_period"
          // Formats the date to show 'Jul 15' for better readability
          tickFormatter={(tick) =>
            new Date(tick).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            })
          }
        />

        {/* Y-Axis: Counts */}
        <YAxis allowDecimals={false} tickFormatter={(tick) => tick} />
        <Tooltip />
        <Legend />

        {/* Line 1: Daily Visits (from daily_visit_count column) */}
        <Line
          type="monotone"
          dataKey="daily_visit_count"
          stroke="#6f4e37"
          name="Daily New Visits"
          dot={false}
        />

        {/* Line 2: Daily Saves (from daily_save_count column) */}
        <Line
          type="monotone"
          dataKey="daily_save_count"
          stroke="#74A12E"
          name="Daily Saves"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TwoLineActivityChart;
