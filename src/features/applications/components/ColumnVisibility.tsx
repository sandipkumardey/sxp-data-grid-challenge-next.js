'use client';

import { useMemo } from 'react';
import { Check, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Type for AG Grid's ColumnApi
type ColumnApi = any;

interface ColumnVisibilityProps {
  columnApi: ColumnApi | null;
  columnDefs: any[];
  columnState: any[];
  onColumnStateChange: (state: any[]) => void;
}

export function ColumnVisibility({
  columnApi,
  columnDefs,
  columnState,
  onColumnStateChange,
}: ColumnVisibilityProps) {
  const handleColumnToggle = (colId: string, hide: boolean) => {
    if (!columnApi) return;
    
    // Update column visibility
    columnApi.setColumnVisible(colId, !hide);
    
    // Update the column state in parent component
    const newState = [...(columnState || [])];
    const colState = newState.find(col => col.colId === colId);
    
    if (colState) {
      colState.hide = hide;
    } else {
      newState.push({ colId, hide });
    }
    
    onColumnStateChange(newState);
  };

  // Create a map of column IDs to their current visibility state
  const columnVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = {};
    columnDefs.forEach(col => {
      visibility[col.field] = !columnState?.some(cs => cs.colId === col.field && cs.hide);
    });
    return visibility;
  }, [columnDefs, columnState]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Columns className="h-4 w-4" />
          <span className="hidden sm:inline">Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columnDefs.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.field}
            checked={columnVisibility[column.field] ?? true}
            onCheckedChange={(checked) => handleColumnToggle(column.field, !checked)}
            className="flex items-center"
          >
            {column.headerName || column.field}
            {columnVisibility[column.field] && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
