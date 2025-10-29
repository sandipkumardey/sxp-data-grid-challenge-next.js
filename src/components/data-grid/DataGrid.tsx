// src/components/data-grid/DataGrid.tsx
'use client';

import { AgGridReact } from '@ag-grid-community/react';
import { useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  ColDef, 
  GridReadyEvent, 
  GridApi, 
  GridOptions,
  GetRowIdParams
} from '@ag-grid-community/core';
import { Application } from '@/types/application';
import { useGridState } from '@/hooks/useGridState';
import { Button } from '@/components/ui/button';
import { FileDown, FileText } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useTheme } from 'next-themes';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

interface DataGridProps {
  rowData: Record<string, unknown>[];
  columnDefs: ColDef[];
  onGridReady?: (params: GridReadyEvent) => void;
  onSelectionChanged?: (selectedRows: Application[]) => void;
  columnVisibility?: Record<string, boolean>;
  searchQuery?: string;
}

export function DataGrid({ 
  rowData, 
  columnDefs, 
  onGridReady,
  onSelectionChanged,
  columnVisibility,
  searchQuery
}: DataGridProps) {
  const gridApiRef = useRef<GridApi | null>(null);
  const [gridState, setGridState] = useGridState();
  

  // Safe wrapper around AG Grid API to reduce any-casts
  function gridApiSafe(api: GridApi | null) {
    const a = api as unknown as {
      setGridOption?: (key: string, value: unknown) => void;
      getColumns?: () => Array<{ getColId?: () => string; isVisible?: () => boolean }>;
      setColumnVisible?: (field: string, visible: boolean) => void;
      getSortModel?: () => unknown[];
      setSortModel?: (model: unknown) => void;
      getFilterModel?: () => unknown;
      setFilterModel?: (model: unknown) => void;
      paginationGetCurrentPage?: () => number;
      paginationGetPageSize?: () => number;
      paginationGoToPage?: (page: number) => void;
      paginationSetPageSize?: (size: number) => void;
      forEachNodeAfterFilterAndSort?: (cb: (node: { data: Record<string, unknown> }) => void) => void;
    };
    return {
      setQuickFilter(text: string) {
        a?.setGridOption?.('quickFilterText', text);
      },
      getColumns(): Array<{ getColId?: () => string; isVisible?: () => boolean }> {
        return a?.getColumns?.() || [];
      },
      setColumnVisible(field: string, visible: boolean) {
        a?.setColumnVisible?.(field, visible);
      },
      getSortModel(): unknown[] {
        return a?.getSortModel?.() || [];
      },
      setSortModel(model: unknown) {
        a?.setSortModel?.(model);
      },
      getFilterModel(): unknown {
        return a?.getFilterModel?.() || {};
      },
      setFilterModel(model: unknown) {
        a?.setFilterModel?.(model);
      },
      getPagination(): { page: number; pageSize: number } {
        return {
          page: a?.paginationGetCurrentPage?.() || 0,
          pageSize: a?.paginationGetPageSize?.() || 20,
        };
      },
      setPagination(page: number, pageSize: number) {
        a?.paginationGoToPage?.(page);
        a?.paginationSetPageSize?.(pageSize);
      },
      forEachNodeAfterFilterAndSort(cb: (node: { data: Record<string, unknown> }) => void) {
        a?.forEachNodeAfterFilterAndSort?.(cb);
      },
    };
  }

  // Apply external column visibility toggles
  useEffect(() => {
    if (!gridApiRef.current || !columnVisibility) return;
    const api = gridApiSafe(gridApiRef.current);
    Object.entries(columnVisibility).forEach(([field, visible]) => {
      api.setColumnVisible(field, !!visible);
    });
  }, [columnVisibility]);

  // Apply global quick filter from external search query
  useEffect(() => {
    if (!gridApiRef.current) return;
    const api = gridApiSafe(gridApiRef.current);
    api.setQuickFilter(searchQuery ?? '');
  }, [searchQuery]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    minWidth: 100,
  }), []);

  const onGridReadyInternal = useCallback((params: GridReadyEvent) => {
    gridApiRef.current = params.api;
    // Access to columnApi is not strictly needed for our features
    
    // Restore grid state
    // If we later need column state restore, we can add it with typed wrapper for columnApi

    if (gridState.sortModel.length > 0) {
      const api = gridApiSafe(gridApiRef.current);
      api.setSortModel(JSON.parse(gridState.sortModel[0]));
    }

    if (gridState.filterModel) {
      const api = gridApiSafe(gridApiRef.current);
      const filterModel = typeof gridState.filterModel === 'string' 
        ? JSON.parse(gridState.filterModel) 
        : gridState.filterModel;
      api.setFilterModel(filterModel);
    }

    const api = gridApiSafe(gridApiRef.current);
    api.setPagination(gridState.paginationPage, gridState.paginationPageSize);

    onGridReady?.(params);
  }, [gridState, onGridReady]);

  const onSortChanged = useCallback(() => {
    const api = gridApiSafe(gridApiRef.current);
    const sortModel = api.getSortModel();
    setGridState({
      sortModel: sortModel ? [JSON.stringify(sortModel)] : []
    });
  }, [setGridState]);

  const onFilterChanged = useCallback(() => {
    const api = gridApiSafe(gridApiRef.current);
    const filterModel = api.getFilterModel();
    setGridState({
      filterModel: JSON.stringify(filterModel)
    });
  }, [setGridState]);

  const onColumnMoved = useCallback(() => {
    const api: any = gridApiRef.current as any;
    const columnState = api?.getColumnState?.();
    setGridState({
      columnState: JSON.stringify(columnState)
    });
  }, [setGridState]);

  const onColumnVisible = useCallback(() => {
    const api = gridApiSafe(gridApiRef.current);
    const cols: Array<{ isVisible?: () => boolean; getColId?: () => string }> = api.getColumns() || [];
    const hiddenColumns: string[] = cols
      .filter((col) => !col?.isVisible?.())
      .map((col) => col?.getColId?.() || '')
      .filter(Boolean);

    setGridState({ hiddenColumns });
  }, [setGridState]);

  const onPaginationChanged = useCallback(() => {
    if (!gridApiRef.current) return;
    const api = gridApiSafe(gridApiRef.current);
    const { page, pageSize } = api.getPagination();
    setGridState({ paginationPage: page, paginationPageSize: pageSize });
  }, [setGridState]);

  const onSelectionChangedInternal = useCallback(() => {
    if (!gridApiRef.current) return;
    
    const selectedNodes = gridApiRef.current.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data as Application);
    onSelectionChanged?.(selectedData);
  }, [onSelectionChanged]);

  const exportToExcel = useCallback(() => {
    if (!gridApiRef.current) return;

    const rowData: Record<string, unknown>[] = [];
    gridApiSafe(gridApiRef.current).forEachNodeAfterFilterAndSort((node) => {
      rowData.push(node.data);
    });

    const worksheet = XLSX.utils.json_to_sheet(rowData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, 'applications.xlsx');
  }, []);

  const exportToCSV = useCallback(() => {
    if (!gridApiRef.current) return;

    const params = {
      fileName: 'applications.csv',
    } as const;

    gridApiRef.current.exportDataAsCsv(params);
  }, []);

  const gridOptions: GridOptions = useMemo(() => ({
    getRowId: (params: GetRowIdParams) => params.data.id,
    suppressCellFocus: true,
    suppressRowClickSelection: true,
    rowSelection: 'multiple',
    suppressMenuHide: true,
    suppressDragLeaveHidesColumns: true,
    pagination: true,
    paginationPageSize: gridState.paginationPageSize,
    defaultColDef,
    onSortChanged,
    onFilterChanged,
    onColumnMoved,
    onColumnVisible,
    onPaginationChanged,
    onSelectionChanged: onSelectionChangedInternal,
  }), [
    defaultColDef,
    gridState.paginationPageSize,
    onFilterChanged,
    onSortChanged,
    onColumnMoved,
    onColumnVisible,
    onPaginationChanged,
    onSelectionChangedInternal
  ]);

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportToExcel}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Export to Excel
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportToCSV}
          className="gap-2"
        >
          <FileDown className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      <ThemedGrid>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          onGridReady={onGridReadyInternal}
          gridOptions={gridOptions}
          loadingOverlayComponent="loadingOverlayComponent"
          loadingOverlayComponentParams={{ loadingMessage: 'Loading applications...' }}
          rowMultiSelectWithClick
          suppressRowClickSelection
          suppressCellFocus
          suppressMenuHide
          suppressDragLeaveHidesColumns
          pagination
          paginationPageSize={gridState.paginationPageSize}
          defaultColDef={defaultColDef}
          onSortChanged={onSortChanged}
          onFilterChanged={onFilterChanged}
          onColumnMoved={onColumnMoved}
          onColumnVisible={onColumnVisible}
          onPaginationChanged={onPaginationChanged}
          onSelectionChanged={onSelectionChangedInternal}
        />
      </ThemedGrid>
    </div>
  );
}

function ThemedGrid({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const themeClass = theme === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';
  return (
    <div className={`${themeClass} flex-1 w-full min-h-[600px] rounded-md overflow-hidden border border-border bg-card`}>
      {children}
    </div>
  );
}