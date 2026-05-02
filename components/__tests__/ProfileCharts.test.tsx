/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import ProfileCharts from '../ProfileCharts';
import { UserVisit } from '@/lib/types';

// Mock the Recharts library
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: any) => <div data-testid="bar">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}));

// Mock the ColumnSelectDropdown component
jest.mock('../ColumnSelectDropdown', () => {
  const MockColumnSelectDropdown = ({ columns, onSelectColumn }: any) => (
    <div data-testid="column-select-dropdown">
      {columns.map((col: string) => <div key={col} data-testid={`dropdown-item-${col}`} onClick={() => onSelectColumn(col)}>{col}</div>)}
    </div>
  );
  MockColumnSelectDropdown.displayName = 'ColumnSelectDropdown';
  return MockColumnSelectDropdown;
});

describe('ProfileCharts', () => {
  const mockVisitedCafes: UserVisit[] = [
    { coffee_shops: { id: 1, city: 'Los Angeles', busyness: 'Medium', pricing: '$$', vibe: 'Cozy', parking: 'Easy', seating: 'Some', has_outlets: true, has_wifi: true } as any, id: '1', coffee_shop_id: 1, profile_id: 'user1', visited_at: '2023-01-01' } as any,
  ];

  it('renders the title and description', () => {
    render(<ProfileCharts visitedCafes={mockVisitedCafes} />);
    expect(screen.getByText('Visited Cafes Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Analyze your visited cafe preferences.')).toBeInTheDocument();
  });

  it('displays an empty message when no visited cafes are provided', () => {
    render(<ProfileCharts visitedCafes={[]} />);
    expect(screen.getByText("You haven't visited any cafes yet.")).toBeInTheDocument();
  });
});
