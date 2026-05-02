
import React from 'react';

export const ResponsiveContainer = ({ children }) => <div className="recharts-responsive-container">{children}</div>;
export const PieChart = ({ children }) => <div className="recharts-pie-chart">{children}</div>;
export const Pie = ({ data, outerRadius, dataKey, label, children }) => (
  <div className="recharts-pie" data-testid="pie-chart" data-outer-radius={outerRadius} data-data-key={dataKey} data-label={label ? label({ percent: 0.1 }) : ''}>
    <div data-testid="pie-data">{JSON.stringify(data)}</div>
    {children}
  </div>
);
export const Cell = ({ children }) => <div className="recharts-cell">{children}</div>;
export const Tooltip = ({ active, payload }) =>
  active && payload && payload.length ? (
    <div className="recharts-tooltip">
      <p>{`${payload[0].name} : ${payload[0].value}`}</p>
    </div>
  ) : null;
export const Legend = () => <div className="recharts-legend"></div>;
