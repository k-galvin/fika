import React from 'react';
import { render, screen } from '@testing-library/react';
import VisitedCafesPieChart from '../VisitedCafesPieChart';

// Mock recharts components to simplify testing and avoid complex SVG rendering issues
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div className="recharts-responsive-container">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div className="recharts-pie-chart">{children}</div>,
  Pie: ({ data, outerRadius, dataKey, label, children }: { data: { name: string; value: number }[]; outerRadius: number; dataKey: string; label: ({ name, percent }: { name: string; percent: number }) => string; children: React.ReactNode }) => (
    <div className="recharts-pie" data-testid="pie-chart" data-outer-radius={outerRadius} data-data-key={dataKey} data-label={label ? label({ percent: 0.1 }) : ''}>
      <div data-testid="pie-data">{JSON.stringify(data)}</div>
      {children}
    </div>
  ),
  Cell: (props: { fill: string; key: string }) => <div className="recharts-cell" data-cell-props={JSON.stringify(props)}></div>,
  Tooltip: () => <div className="recharts-tooltip"></div>,
  Legend: () => <div className="recharts-legend"></div>,
}));

describe('VisitedCafesPieChart', () => {
  const mockData = [
    { name: 'Category A', value: 10 },
    { name: 'Category B', value: 20 },
    { name: 'Category C', value: 30 },
  ];

  it('renders the chart title correctly', () => {
    render(<VisitedCafesPieChart data={mockData} title="Test Category" />);
    expect(screen.getByText('Test Category Breakdown')).toBeInTheDocument();
  });

  it('renders a message when no data is available', () => {
    render(<VisitedCafesPieChart data={[]} title="Empty Category" />);
    expect(screen.getByText('No data available for Empty Category.')).toBeInTheDocument();
  });

  it('renders the Pie component with correct data and props', () => {
    render(<VisitedCafesPieChart data={mockData} title="Test Category" />);
    const pieElement = screen.getByTestId('pie-chart');
    const pieDataElement = screen.getByTestId('pie-data');
    const pieData = JSON.parse(pieDataElement.textContent || '[]');
    
    expect(pieData).toEqual(mockData);
    expect(pieElement.dataset.outerRadius).toBe('70');
    expect(pieElement.dataset.dataKey).toBe('value');
    expect(pieElement.dataset.label).toBe('10%');
  });

  it('renders the correct number of Cells based on data', () => {
    render(<VisitedCafesPieChart data={mockData} title="Test Category" />);
    const cells = screen.getAllByText('', { selector: '.recharts-cell' });
    expect(cells).toHaveLength(mockData.length);
  });
});