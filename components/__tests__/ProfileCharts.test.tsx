import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileCharts from '../ProfileCharts';
import { CoffeeShop, UserVisit } from '@/lib/types';

// Mock child components
jest.mock('../VisitedCafesPieChart', () => {
  const MockVisitedCafesPieChart = ({ data, title }: { data: { name: string; value: number }[]; title: string }) => (
    <div data-testid="mock-pie-chart" data-chart-data={JSON.stringify(data)} data-chart-title={title}></div>
  );
  MockVisitedCafesPieChart.displayName = 'VisitedCafesPieChart';
  return MockVisitedCafesPieChart;
});
jest.mock('../ColumnSelectDropdown', () => {
  const MockColumnSelectDropdown = ({
    selectedColumn, onSelectColumn, columns
  }: { selectedColumn: string; onSelectColumn: (column: string) => void; columns: string[] }) => (
    <div data-testid="mock-dropdown">
      <button onClick={() => onSelectColumn('busyness')}>{selectedColumn}</button>
      {columns.map((col: string) => <div key={col} data-testid={`dropdown-item-${col}`} onClick={() => onSelectColumn(col)}>{col}</div>)}
    </div>
  );
  MockColumnSelectDropdown.displayName = 'ColumnSelectDropdown';
  return MockColumnSelectDropdown;
});

describe('ProfileCharts', () => {
  const mockVisitedCafes: UserVisit[] = [
    { coffee_shops: { id: 1, city: 'Los Angeles', busyness: 'Medium', pricing: '$$', vibe: 'Cozy', parking: 'Easy', seating: 'Some', has_outlets: true, has_wifi: true } as CoffeeShop, id: '1', coffee_shop_id: 1, profile_id: 'user1', visited_at: '2023-01-01' },
    { coffee_shops: { id: 2, city: 'Los Angeles', busyness: 'Quiet', pricing: '$', vibe: 'Minimalistic', parking: 'Medium', seating: 'Plenty', has_outlets: false, has_wifi: true } as CoffeeShop, id: '2', coffee_shop_id: 2, profile_id: 'user1', visited_at: '2023-01-02' },
    { coffee_shops: { id: 3, city: 'Newport Beach', busyness: 'Medium', pricing: '$$', vibe: 'Beachy', parking: 'Hard', seating: 'None', has_outlets: true, has_wifi: false } as CoffeeShop, id: '3', coffee_shop_id: 3, profile_id: 'user1', visited_at: '2023-01-03' },
    { coffee_shops: { id: 4, city: 'Los Angeles', busyness: 'Medium', pricing: '$$', vibe: 'Cozy', parking: 'Easy', seating: 'Some', has_outlets: true, has_wifi: true } as CoffeeShop, id: '4', coffee_shop_id: 4, profile_id: 'user1', visited_at: '2023-01-04' },
  ];

  it('renders the title and description', () => {
    render(<ProfileCharts visitedCafes={mockVisitedCafes} />);
    expect(screen.getByText('Visited Cafes Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Analyze your visited cafe preferences.')).toBeInTheDocument();
  });

  it('renders the ColumnSelectDropdown with correct props', () => {
    render(<ProfileCharts visitedCafes={mockVisitedCafes} />);
    const dropdown = screen.getByTestId('mock-dropdown');
    expect(dropdown).toBeInTheDocument();
    // Check if initial selected column is 'city' by targeting the button
    expect(screen.getByRole('button', { name: 'city' })).toBeInTheDocument();
  });

  it(`renders the VisitedCafesPieChart with initial data for 'city'`, () => {
    render(<ProfileCharts visitedCafes={mockVisitedCafes} />);
    const pieChart = screen.getByTestId('mock-pie-chart');
    expect(pieChart).toBeInTheDocument();
    const chartData = JSON.parse(pieChart.dataset.chartData || '[]');
    expect(chartData).toEqual([
      { name: 'Los Angeles', value: 3 },
      { name: 'Newport Beach', value: 1 },
    ]);
    expect(pieChart.dataset.chartTitle).toBe('City');
  });

  it('updates the pie chart data when a new column is selected', () => {
    render(<ProfileCharts visitedCafes={mockVisitedCafes} />);
    
    // Simulate selecting 'busyness'
    fireEvent.click(screen.getByText('busyness')); // Click the mock dropdown item for busyness

    const pieChart = screen.getByTestId('mock-pie-chart');
    const chartData = JSON.parse(pieChart.dataset.chartData || '[]');
    expect(chartData).toEqual([
      { name: 'Medium', value: 3 },
      { name: 'Quiet', value: 1 },
    ]);
    expect(pieChart.dataset.chartTitle).toBe('Busyness');
  });

  it('handles boolean columns correctly (e.g., has_wifi)', () => {
    render(<ProfileCharts visitedCafes={mockVisitedCafes} />);
    
    // Simulate selecting 'has_wifi'
    fireEvent.click(screen.getByText('has_wifi'));

    const pieChart = screen.getByTestId('mock-pie-chart');
    const chartData = JSON.parse(pieChart.dataset.chartData || '[]');
    expect(chartData).toEqual([
      { name: 'Yes', value: 3 },
      { name: 'No', value: 1 },
    ]);
    expect(pieChart.dataset.chartTitle).toBe('Has Wifi');
  });
});