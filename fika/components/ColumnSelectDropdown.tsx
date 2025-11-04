import React from 'react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface ColumnSelectDropdownProps {
  selectedColumn: string;
  onSelectColumn: (column: string) => void;
  columns: string[];
}

const ColumnSelectDropdown: React.FC<ColumnSelectDropdownProps> = ({
  selectedColumn,
  onSelectColumn,
  columns,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="capitalize">
          {selectedColumn.replace(/_/g, ' ')} <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select Breakdown Category</DropdownMenuLabel>
        {columns.map((column) => (
          <DropdownMenuItem key={column} onClick={() => onSelectColumn(column)} className="capitalize">
            {column.replace(/_/g, ' ')}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnSelectDropdown;
