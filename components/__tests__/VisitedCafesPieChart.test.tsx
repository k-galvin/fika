import React from 'react';
import { render, screen } from '@testing-library/react';
import VisitedCafesPieChart from '../VisitedCafesPieChart';



describe('VisitedCafesPieChart', () => {
  const mockData = [
    { name: 'Category A', value: 10 },
    { name: 'Category B', value: 20 },
    { name: 'Category C', value: 30 },
  ];

  it('renders the chart title correctly', () => {
    render(<VisitedCafesPieChart data={mockData} title="Test Category" />);
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('renders a message when no data is available', () => {
    render(<VisitedCafesPieChart data={[]} title="Empty Category" />);
    expect(screen.getByText(/No entries recorded for Empty Category/i)).toBeInTheDocument();
  });

  it('renders the Pie component with correct data and props', () => {
    render(<VisitedCafesPieChart data={mockData} title="Test Category" />);
    const pieElement = screen.getByTestId('pie-chart');
    const pieDataElement = screen.getByTestId('pie-data');
    const pieData = JSON.parse(pieDataElement.textContent || '[]');
    
    expect(pieData).toEqual(mockData);
    expect(pieElement.dataset.outerRadius).toBe('80');
    expect(pieElement.dataset.dataKey).toBe('value');
    expect(pieElement.dataset.label).toBe('Category A (10%)');
  });

  it('renders the correct number of Cells based on data', () => {
    render(<VisitedCafesPieChart data={mockData} title="Test Category" />);
    const cells = screen.getAllByText('', { selector: '.recharts-cell' });
    expect(cells).toHaveLength(mockData.length);
  });
});