
import React from 'react';

export const ResponsiveContainer = ({ children }) => <div className="recharts-responsive-container">{children}</div>;
export const PieChart = ({ children }) => <div className="recharts-pie-chart">{children}</div>;
export const Pie = ({ data, outerRadius, dataKey, label, children }) => {
  let labelText = '';
  if (label && data && data.length > 0) {
    const renderedLabel = label({ name: data[0].name, percent: 0.1, x: 100, y: 100, cx: 50 });
    if (typeof renderedLabel === 'string') {
      labelText = renderedLabel;
    } else if (renderedLabel && renderedLabel.props && renderedLabel.props.children) {
      labelText = renderedLabel.props.children;
    }
  }
  return (
    <div className="recharts-pie" data-testid="pie-chart" data-outer-radius={outerRadius} data-data-key={dataKey} data-label={labelText}>
      <div data-testid="pie-data">{JSON.stringify(data)}</div>
      {children}
    </div>
  );
};
export const Cell = ({ children }) => <div className="recharts-cell">{children}</div>;
export const Tooltip = ({ active, payload }) =>
  active && payload && payload.length ? (
    <div className="recharts-tooltip">
      <p>{`${payload[0].name} : ${payload[0].value}`}</p>
    </div>
  ) : null;
export const Legend = () => <div className="recharts-legend"></div>;
export const BarChart = ({ children }) => <div className="recharts-bar-chart">{children}</div>;
export const Bar = ({ children }) => <div className="recharts-bar">{children}</div>;
export const XAxis = () => <div className="recharts-xaxis"></div>;
export const YAxis = () => <div className="recharts-yaxis"></div>;
export const CartesianGrid = () => <div className="recharts-cartesian-grid"></div>;
