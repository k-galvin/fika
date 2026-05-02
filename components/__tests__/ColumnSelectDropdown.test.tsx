import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ColumnSelectDropdown from '../ColumnSelectDropdown';

// Mock shadcn/ui components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: { children: React.ReactNode; className?: string; variant?: string }) => <button {...props}>{typeof children === 'string' ? children.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : children}</button>,
}));
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => <div onClick={onClick} data-testid="dropdown-item">{typeof children === 'string' ? children.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : children}</div>,
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-label">{children}</div>,
}));
jest.mock('lucide-react', () => ({
  ChevronDown: () => <span data-testid="chevron-down"></span>,
}));

describe('ColumnSelectDropdown', () => {
  const mockColumns = ['city', 'busyness', 'has_wifi'];
  const mockOnSelectColumn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the selected column name correctly', () => {
    render(
      <ColumnSelectDropdown
        selectedColumn="busyness"
        onSelectColumn={mockOnSelectColumn}
        columns={mockColumns}
      />
    );
    expect(screen.getByText('Busyness')).toBeInTheDocument();
  });

  it('renders the dropdown label', () => {
    render(
      <ColumnSelectDropdown
        selectedColumn="city"
        onSelectColumn={mockOnSelectColumn}
        columns={mockColumns}
      />
    );
    expect(screen.getByText('Select Breakdown Category')).toBeInTheDocument();
  });

  it('renders all provided columns as dropdown items', () => {
    render(
      <ColumnSelectDropdown
        selectedColumn="city"
        onSelectColumn={mockOnSelectColumn}
        columns={mockColumns}
      />
    );
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('Busyness')).toBeInTheDocument();
    expect(screen.getByText('Has Wifi')).toBeInTheDocument();
  });

  it('calls onSelectColumn with the correct column when an item is clicked', () => {
    render(
      <ColumnSelectDropdown
        selectedColumn="city"
        onSelectColumn={mockOnSelectColumn}
        columns={mockColumns}
      />
    );
    fireEvent.click(screen.getByText('Busyness'));
    expect(mockOnSelectColumn).toHaveBeenCalledTimes(1);
    expect(mockOnSelectColumn).toHaveBeenCalledWith('busyness');
  });
});