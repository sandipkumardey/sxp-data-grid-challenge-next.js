'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ColDef, GridReadyEvent, GridApi, GridOptions } from '@ag-grid-community/core';
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
import { Download, Search } from 'lucide-react';

// Only using Community Edition modules
const modules = [ClientSideRowModelModule];

import { Application, GridState } from '../types/application';
import { useUrlState } from '../hooks/useUrlState';
import { loadApplications, extractUniqueSkills } from '../utils/loadData';


export function ApplicationsGrid() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  // Column API is now part of the GridApi in newer versions
  const [uniqueSkills, setUniqueSkills] = useState<string[]>([]);
  
  // Get URL state and setter
  const [urlState, setUrlState] = useUrlState();
  
  // Destructure the state for easier access
  const { sortModel, filterModel, pagination, searchQuery } = urlState;

  // Load applications data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await loadApplications();
        setApplications(data);
        setUniqueSkills(extractUniqueSkills(data));
      } catch (error) {
        console.error('Failed to load applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      valueFormatter: (params: { value?: number | null }) => params.value !== undefined && params.value !== null ? `${params.value} LPA` : '',
    },
    { 
      field: 'expectedCTC', 
      headerName: 'Expected CTC (LPA)',
      filter: 'agNumberColumnFilter',
      width: 150,
      type: 'numericColumn',
      headerClass: 'font-medium',
      cellClass: 'text-right',
      valueFormatter: (params: { value?: number | null }) => params.value !== undefined && params.value !== null ? `${params.value} LPA` : '',
    },
  ], []);

  // Grid ready event
  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  // Apply grid state when grid is ready
  useEffect(() => {
    if (!gridApi) return;

    // Apply sort model
    if (sortModel && sortModel.length > 0) {
      gridApi.applyColumnState({
        state: sortModel.map(sort => ({
          colId: sort.colId,
          sort: sort.sort || null,
        })),
        applyOrder: true,
      });
    }

    // Apply filter model
    if (filterModel) {
      gridApi.setFilterModel(filterModel);
    }

    // Apply pagination
    if (pagination) {
      // Set pagination page size through grid options
      gridApi.setGridOption('paginationPageSize', pagination.pageSize);
      // Go to the specified page
      gridApi.paginationGoToPage(pagination.currentPage);
    }
  }, [gridApi, sortModel, filterModel, pagination]);

  // Handle grid state changes with proper types
  const onSortChanged = useCallback(() => {
    if (!gridApi) return;
    const newSortModel = gridApi.getColumnState()
      .filter(col => col.sort)
      .map(col => ({
        colId: col.colId || '',
        sort: col.sort === 'asc' || col.sort === 'desc' ? col.sort : null
      }));
    
    setUrlState(prev => ({
      ...prev,
      sortModel: newSortModel
    }));
  }, [gridApi, setUrlState]);

  const onFilterChanged = useCallback(() => {
    if (!gridApi) return;
    const newFilterModel = gridApi.getFilterModel();
    setUrlState(prev => ({
      ...prev,
      filterModel: newFilterModel
    }));
  }, [gridApi, setUrlState]);

  const onColumnMoved = useCallback(() => {
    if (!gridApi) return;
    const columnState = gridApi.getColumnState();
    setUrlState(prev => ({
      ...prev,
      columnState
    }));
  }, [gridApi, setUrlState]);

  const onPaginationChanged = useCallback(() => {
    if (!gridApi) return;
    const currentPage = gridApi.paginationGetCurrentPage() || 0;
    const pageSize = gridApi.paginationGetPageSize();
    setUrlState(prev => ({
      ...prev,
      pagination: { currentPage, pageSize }
    }));
  }, [gridApi, setUrlState]);

  // Grid options - Community Edition only
  const gridOptions: GridOptions = useMemo(() => ({
    defaultColDef: {
      filter: true,
      sortable: true,
      resizable: true,
      flex: 1,
      minWidth: 120,
      menuTabs: ['filterMenuTab'],
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true,
      },
      cellStyle: { display: 'flex', alignItems: 'center' },
    },
    pagination: true,
    paginationPageSize: pagination?.pageSize || 20,
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    suppressCellFocus: true,
    suppressDragLeaveHidesColumns: true,
    suppressMenuHide: true,
    animateRows: true,
    rowClass: 'hover:bg-muted/50',
    onGridReady: (params) => {
      setGridApi(params.api);
    },
    onSortChanged: onSortChanged,
    onFilterChanged: onFilterChanged,
    onPaginationChanged: onPaginationChanged,
  }), [onSortChanged, onFilterChanged, onPaginationChanged, pagination?.pageSize]);

  // CSV Export (Community Edition)
  const handleExportCSV = useCallback(() => {
    if (!gridApi) return;
    gridApi.exportDataAsCsv({
      fileName: `applications_${new Date().toISOString().slice(0, 10)}.csv`,
    });
  }, [gridApi]);

  // Loading state
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
                  onChange={(e) => setUrlState(prev => ({ ...prev, searchQuery: e.target.value }))}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
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
