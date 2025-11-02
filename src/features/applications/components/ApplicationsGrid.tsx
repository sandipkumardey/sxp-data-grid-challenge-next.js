'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import type { 
  ColDef, 
  GridReadyEvent, 
  GridApi, 
  GridOptions,
  ColumnState,
  SortModelItem,
  Column,
  ICellRendererParams,
  IHeaderParams
} from '@ag-grid-community/core';

// Import AG Grid styles
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-alpine.css';
import '@/styles/ag-theme-custom.css';

// Type for AG Grid's ColumnApi
type ColumnApi = any; // Using any as a fallback for ColumnApi
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';

// Register the required modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule
]);

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
import { FileText, FileSpreadsheet, Download, Search, ClipboardList, Users, Award, Plus } from 'lucide-react';
import { ColumnVisibility } from './ColumnVisibility';

// Define the modules used by AG Grid (Community Edition only)
const modules = [ClientSideRowModelModule];

import { Application } from '../types/application';
import { useGridState } from '../hooks/useGridState';
import { loadApplications } from '../utils/loadData';


// Stats component to show summary cards
function StatsCard({ title, value, icon: Icon, trend, trendValue }: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
}) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          {trend && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold">{value}</h3>
        </div>
      </div>
    </div>
  );
}

export function ApplicationsGrid() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [columnApi, setColumnApi] = useState<ColumnApi | null>(null);
  
  // Use the new useGridState hook
  const [gridState, updateGridState] = useGridState();
  
  // Destructure the state for easier access
  const { sortModel, filterModel, columnState, pagination, searchQuery } = gridState;

  // Calculate stats
  const stats = useMemo(() => {
    if (!applications.length) return null;
    
    const totalApplications = applications.length;
    const inReview = applications.filter(app => app.status === 'In Review').length;
    const interviewStage = applications.filter(app => 
      ['Phone Screen', 'Technical Interview', 'Onsite'].includes(app.status)
    ).length;
    const offerStage = applications.filter(app => 
      ['Offer Received', 'Negotiating'].includes(app.status)
    ).length;
    
    return {
      total: totalApplications,
      inReview,
      interviewStage,
      offerStage,
      inReviewPercent: Math.round((inReview / totalApplications) * 100),
      interviewPercent: Math.round((interviewStage / totalApplications) * 100),
      offerPercent: Math.round((offerStage / totalApplications) * 100),
    };
  }, [applications]);

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
      headerClass: 'bg-gray-50 dark:bg-gray-800/50 font-medium text-sm uppercase tracking-wider text-gray-600 dark:text-gray-300',
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

  // Get current theme
  const { theme } = useTheme();

  // Update grid theme when theme changes
  useEffect(() => {
    if (gridApi) {
      // Force grid to redraw with new theme
      gridApi.refreshHeader();
      gridApi.refreshCells();
    }
  }, [theme, gridApi]);

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
        ...(value ? { globalQuickFilter: value } : { globalQuickFilter: undefined })
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

  // Grid options with enhanced theming and features
  const gridOptions: GridOptions = {
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      // Removed menuTabs as it requires Enterprise edition
      floatingFilter: false, // Disabled as it requires Enterprise edition
      filterParams: {
        suppressAndOrCondition: true,
        buttons: ['reset', 'apply'],
        closeOnApply: true,
      },
      cellClass: 'flex items-center',
      headerClass: 'font-medium',
    },
    // Enable animations
    animateRows: true,
    // Enable row selection
    rowSelection: 'multiple',
    // UI/UX improvements
    suppressRowClickSelection: true,
    suppressCellFocus: true,
    rowHeight: 56,
    headerHeight: 48,
    // Performance optimizations
    suppressDragLeaveHidesColumns: true,
    suppressMenuHide: true,
    suppressContextMenu: true,
    suppressClipboardPaste: true,
    suppressExcelExport: true,
    suppressCsvExport: true,
    suppressPaginationPanel: true,
    suppressScrollOnNewData: true,
    suppressMovableColumns: true,
    suppressFieldDotNotation: true,
    // Loading and empty states
    loadingOverlayComponent: 'customLoadingOverlay',
    noRowsOverlayComponent: 'customNoRowsOverlay',
    // Theme and styling
    rowClass: 'border-b border-gray-100 dark:border-gray-700',
    // Disable range selection as it requires Enterprise edition
    enableRangeSelection: false,
    // Disable status bar as it requires Enterprise edition
    // statusBar: {
    //   statusPanels: [
    //     {
    //       statusPanel: 'agTotalAndFilteredRowCountComponent',
    //       align: 'left',
    //     },
    //     { statusPanel: 'agSelectedRowCountComponent', align: 'right' },
    //     { statusPanel: 'agAggregationComponent', align: 'right' },
    //   ],
    // },
    // Add custom tooltips
    tooltipShowDelay: 500,
    tooltipHideDelay: 2000,
    // Enable pagination
    pagination: true,
    paginationPageSize: 20,
    cacheBlockSize: 20,
    // Enable column animations
    defaultColGroupDef: { marqueeSelection: true } as any,
    // Enable keyboard navigation
    enableCellTextSelection: true,
    // Enable accessibility
    enableRtl: false,
    // Enable custom loading overlay
    overlayLoadingTemplate:
      '<div class="custom-loading-overlay"><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div><p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading data...</p></div>',
    // Custom no rows template
    overlayNoRowsTemplate:
      '<div class="custom-no-rows-overlay"><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No applications found</h3><p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new application.</p><div class="mt-6"><button type="button" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"><Plus className="-ml-1 mr-2 h-5 w-5" /> New Application</button></div></div>',
  };

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
    // In Community Edition, we'll fall back to CSV
    handleExportCSV();
  }, [handleExportCSV]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Skeleton className="h-10 w-48" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total Applications" 
            value={stats.total} 
            icon={FileText} 
          />
          <StatsCard 
            title="In Review" 
            value={`${stats.inReview} (${stats.inReviewPercent}%)`} 
            icon={ClipboardList}
            trend="up"
            trendValue="12%"
          />
          <StatsCard 
            title="Interview Stage" 
            value={`${stats.interviewStage} (${stats.interviewPercent}%)`} 
            icon={Users}
            trend="up"
            trendValue="5%"
          />
          <StatsCard 
            title="Offer Stage" 
            value={`${stats.offerStage} (${stats.offerPercent}%)`} 
            icon={Award}
            trend="up"
            trendValue="3%"
          />
        </div>
      )}

      {/* Grid Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search applications..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => updateGridState({ searchQuery: e.target.value })}
          />
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <ColumnVisibility
            columnDefs={columnDefs}
            onColumnVisibilityChanged={(params: { column: Column; visible: boolean }[]) => {
              if (columnApi) {
                params.forEach(({ column, visible }) => {
                  columnApi.setColumnVisible(column.getColId(), visible);
                });
              }
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>Export as PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Application</span>
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-t-lg px-4 py-2 mb-0.5">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            0 selected
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800/50">
            <span>Update Status</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800/50">
            <span>Add to List</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50">
            <span>Delete Selected</span>
          </Button>
        </div>
      </div>

      {/* AG Grid */}
      <div className={`ag-theme-custom flex-1 w-full min-h-[500px] rounded-b-lg ${theme === 'dark' ? 'ag-theme-alpine-dark' : ''}`}>
        <AgGridReact
          rowData={applications}
          columnDefs={columnDefs}
          gridOptions={gridOptions}
          onGridReady={onGridReady}
          modules={modules}
          loadingOverlayComponent="customLoadingOverlay"
          noRowsOverlayComponent="customNoRowsOverlay"
          className="w-full h-full ag-theme-custom"
          // Enable animations
          animateRows={true}
          // Enable pagination
          pagination={true}
          paginationPageSize={20}
          // Enable row selection
          rowSelection="multiple"
          suppressRowClickSelection={true}
          // Enable range selection for bulk actions
          enableRangeSelection={true}
          // Enable keyboard navigation
          enableCellTextSelection={true}
          // Custom tooltips
          tooltipShowDelay={500}
          tooltipHideDelay={2000}
          // Styling
          getRowClass={() => 'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150'}
          // Performance optimizations
          suppressColumnVirtualisation={false}
          suppressRowVirtualisation={false}
        />
      </div>
    </div>
  );
}
