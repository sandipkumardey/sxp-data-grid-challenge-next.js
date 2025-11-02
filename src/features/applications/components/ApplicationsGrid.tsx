'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { 
  ColDef, 
  GridReadyEvent, 
  GridApi, 
  GridOptions,
  ColumnState,
  SortModelItem,
  Column
} from '@ag-grid-community/core';

// Type for AG Grid's ColumnApi
type ColumnApi = any; // Using any as a fallback for ColumnApi
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';

// Dynamically import AgGridReact with SSR disabled
const AgGridReact = dynamic(
  () => import('@ag-grid-community/react').then((mod) => mod.AgGridReact),
  { ssr: false }
);
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, Search, Columns, FileText, FileSpreadsheet } from 'lucide-react';
import { ColumnVisibility } from './ColumnVisibility';

// Only using Community Edition modules
const modules = [ClientSideRowModelModule];

import { Application } from '../types/application';
import { useGridState } from '../hooks/useGridState';
import { loadApplications } from '../utils/loadData';


export function ApplicationsGrid() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [columnApi, setColumnApi] = useState<ColumnApi | null>(null);
  
  // Use the new useGridState hook
  const [gridState, updateGridState] = useGridState();
  
  // Destructure the state for easier access
  const { sortModel, filterModel, columnState, pagination, searchQuery } = gridState;

  // Load applications data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadApplications();
        setApplications(data);
        setLoading(false);

        // Apply initial grid state once data is loaded
        if (gridApi && columnApi) {
          if (sortModel && sortModel.length > 0) {
            columnApi.applyColumnState({
              state: sortModel.map(sort => ({
                colId: sort.colId,
                sort: sort.sort || null,
              })),
              applyOrder: true,
            });
          }
          if (filterModel) {
            gridApi.setFilterModel(filterModel);
          }
          if (columnState && columnState.length > 0) {
            columnApi.applyColumnState({
              state: columnState as any,
              applyOrder: true,
            });
          }
        }
      } catch (error) {
        console.error('Error loading applications:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [gridApi, columnApi, sortModel, filterModel, columnState]);

  // Define column definitions - Community Edition only
  const columnDefs = useMemo<ColDef[]>(() => [
    {
      headerName: 'ID',
      field: 'id',
      width: 100,
      filter: 'agNumberColumnFilter',
      sortable: true,
      checkboxSelection: true,
      headerCheckboxSelection: true,
      headerClass: 'font-medium',
      cellClass: 'font-mono text-sm',
    },
    {
      field: 'email',
      headerName: 'Email',
      filter: 'agTextColumnFilter',
      width: 240,
      headerClass: 'font-medium',
      cellClass: 'text-ellipsis overflow-hidden',
    },
    {
      field: 'location',
      headerName: 'Location',
      filter: 'agTextColumnFilter',
      width: 160,
      headerClass: 'font-medium',
    },
    {
      field: 'overallExperience',
      headerName: 'Experience (Years)',
      filter: 'agNumberColumnFilter',
      width: 160,
      type: 'numericColumn',
      headerClass: 'font-medium',
      cellClass: 'text-right',
    },
    {
      field: 'currentWorkType',
      headerName: 'Current Work',
      filter: 'agTextColumnFilter',
      width: 140,
      headerClass: 'font-medium',
    },
    {
      field: 'preferredWorkType',
      headerName: 'Preferred Work',
      filter: 'agTextColumnFilter',
      width: 140,
      headerClass: 'font-medium',
    },
    {
      field: 'ctc',
      headerName: 'Current CTC (LPA)',
      filter: 'agNumberColumnFilter',
      width: 150,
      type: 'numericColumn',
      headerClass: 'font-medium',
      cellClass: 'text-right',
      valueFormatter: (params: { value?: number | null }) =>
        params.value !== undefined && params.value !== null ? `${params.value} LPA` : '',
    },
    {
      field: 'expectedCTC',
      headerName: 'Expected CTC (LPA)',
      filter: 'agNumberColumnFilter',
      width: 150,
      type: 'numericColumn',
      headerClass: 'font-medium',
      cellClass: 'text-right',
      valueFormatter: (params: { value?: number | null }) =>
        params.value !== undefined && params.value !== null ? `${params.value} LPA` : '',
    },
  ], []);

  // Grid ready event
  const onGridReady = useCallback((params: GridReadyEvent) => {
    const { api, columnApi } = params as any; // Type assertion for columnApi
    setGridApi(api);
    setColumnApi(columnApi);
    
    if (!api || !columnApi) return;
    
    // Set up event listeners for grid state changes
    const handleSortChanged = () => {
      const columnStates = columnApi.getColumnState();
      const newSortModel = columnStates
        .filter((col: any) => col.sort)
        .map((col: any) => ({
          colId: col.colId || '',
          sort: col.sort || null,
        }));
      updateGridState({ sortModel: newSortModel });
    };
    
    const handleFilterChanged = () => {
      const filterModel = api.getFilterModel();
      updateGridState({ filterModel });
    };
    
    const handleColumnStateChanged = () => {
      const columnState = columnApi.getColumnState();
      updateGridState({ columnState });
    };
    
    api.addEventListener('sortChanged', handleSortChanged);
    api.addEventListener('filterChanged', handleFilterChanged);
    api.addEventListener('columnMoved', handleColumnStateChanged);
    api.addEventListener('columnResized', handleColumnStateChanged);
    
    // Cleanup function
    return () => {
      api.removeEventListener('sortChanged', handleSortChanged);
      api.removeEventListener('filterChanged', handleFilterChanged);
      api.removeEventListener('columnMoved', handleColumnStateChanged);
      api.removeEventListener('columnResized', handleColumnStateChanged);
    };
  }, [updateGridState]);

  // Set initial search query from URL
  useEffect(() => {
    if (gridApi && !loading && searchQuery) {
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.value = searchQuery;
        // Use filter instead of quickFilter
        gridApi.setFilterModel({
          ...(gridState?.filterModel || {}),
          globalQuickFilter: searchQuery
        });
      }
    }
  }, [gridApi, loading, searchQuery, gridState?.filterModel]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (gridApi) {
      // Use filter instead of quickFilter which might not be available
      gridApi.setFilterModel({
        ...(gridState?.filterModel || {}),
        ...(value ? { globalQuickFilter: value } : { globalQuickFilter: null })
      });
    }
    updateGridState({ searchQuery: value });
  };

  const onPaginationChanged = useCallback(() => {
    if (gridApi) {
      const currentPage = gridApi.paginationGetCurrentPage();
      const pageSize = gridApi.paginationGetPageSize();
      updateGridState({
        pagination: {
          currentPage,
          pageSize,
        },
      });
    }
  }, [gridApi, updateGridState]);

  const gridOptions: GridOptions = useMemo(
    () => ({
      // ...
    }),
    [onGridReady, pagination?.pageSize, gridApi, updateGridState]
  );

  // Handle export to CSV
  const handleExportCSV = useCallback(() => {
    if (gridApi) {
      try {
        gridApi.exportDataAsCsv({
          fileName: `applications-${new Date().toISOString().split('T')[0]}.csv`,
          processCellCallback: (params: any) => {
            // Format date fields if needed
            if (params.column?.getColDef()?.field === 'createdAt' && params.value) {
              return new Date(params.value).toLocaleDateString();
            }
            // Handle skills array
            if (Array.isArray(params.value)) {
              return params.value.map((s: any) => s.name).join(', ');
            }
            return params.value;
          },
        });
      } catch (error) {
        console.error('Error exporting to CSV:', error);
      }
    }
  }, [gridApi]);

  // Handle export to Excel (CSV fallback for Community Edition)
  const handleExportExcel = useCallback(() => {
    // In Community Edition, we'll use CSV as a fallback
    handleExportCSV();
  }, [handleExportCSV]);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Job Applications</CardTitle>
              <p className="text-sm text-muted-foreground">
                {applications.length} applications found
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search applications..."
                  className="w-full pl-9"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex gap-2">
                <ColumnVisibility 
                  columnApi={columnApi}
                  columnDefs={columnDefs}
                  columnState={columnState || []}
                  onColumnStateChange={(newState) => updateGridState({ columnState: newState })}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportCSV}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Export as CSV</span>
                    </DropdownMenuItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <DropdownMenuItem 
                              onClick={handleExportExcel}
                              className="flex items-center"
                              disabled
                            >
                              <FileSpreadsheet className="mr-2 h-4 w-4" />
                              <span>Export as Excel (Enterprise)</span>
                            </DropdownMenuItem>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Excel export is available in AG Grid Enterprise Edition</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="ag-theme-alpine w-full h-[600px]">
            <AgGridReact
              rowData={applications}
              columnDefs={columnDefs}
              onGridReady={onGridReady}
              gridOptions={gridOptions}
              modules={modules}
              rowHeight={48}
              headerHeight={48}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
