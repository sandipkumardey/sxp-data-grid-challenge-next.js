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
import type { ColDef, Column } from '@ag-grid-community/core';

interface ColumnVisibilityProps {
  columnDefs: ColDef[];
  onColumnVisibilityChanged: (params: { column: Column; visible: boolean }[]) => void;
}

export function ColumnVisibility({
  columnDefs,
  onColumnVisibilityChanged,
}: ColumnVisibilityProps) {
  const handleColumnToggle = (colId: string, visible: boolean) => {
    const column = columnDefs.find(col => col.field === colId);
    if (column) {
      onColumnVisibilityChanged([{ column: { getColId: () => colId } as Column, visible }]);
    }
  };

  // Get visible columns
  const visibleColumns = useMemo(() => {
    return columnDefs.filter(col => !col.hide).map(col => col.field as string);
  }, [columnDefs]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Columns className="h-4 w-4" />
          <span>Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columnDefs
          .filter(col => col.field && col.headerName)
          .map((col) => (
            <DropdownMenuCheckboxItem
              key={col.field as string}
              checked={visibleColumns.includes(col.field as string)}
              onCheckedChange={(checked) =>
                handleColumnToggle(col.field as string, checked)
              }
              className="cursor-pointer"
            >
              {col.headerName}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
