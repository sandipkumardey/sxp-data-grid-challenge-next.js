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
  IHeaderParams,
  ValueGetterParams
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
import { FileText, Clock, MessageCircle, Target, Search, FileSpreadsheet, Download, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the modules used by AG Grid (Community Edition only)
const modules = [ClientSideRowModelModule];

import { Application, Skill } from '../types/application';
import { useGridUrlState } from '../hooks/useGridUrlState';
import { ColumnVisibility } from './ColumnVisibility';
import { loadApplications } from '../utils/loadData';
import { exportToCSV, exportToExcel, exportToPDF, getExportStats } from '../utils/exportUtils';


// Stats component to show summary cards
function StatsCard({ title, value, icon: Icon, trend, trendValue, className }: { 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<{ className?: string }>; 
  trend?: 'up' | 'down'; 
  trendValue?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm", className)}>
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
          <div className="flex items-center gap-2">
            {title === 'Total Applications' && <span>📄</span>}
            {title === 'In Review' && <span>⏳</span>}
            {title === 'Interview Stage' && <span>💬</span>}
            {title === 'Offer Stage' && <span>🎯</span>}
            <CardTitle className="text-lg font-semibold tracking-tight">Your Application History</CardTitle>
          </div>
          <h3 className="mt-1 text-2xl font-semibold">{value}</h3>
          {/* Micro trendline */}
          <div className="mt-2 flex items-end gap-1">
            <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: title === 'Total Applications' ? '100%' : title === 'In Review' ? '65%' : title === 'Interview Stage' ? '25%' : '10%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create a client-side only wrapper to prevent hydration issues
function ApplicationsGridClient() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [columnApi, setColumnApi] = useState<ColumnApi | null>(null);
  
  // URL State Management with nuqs
  const {
    hiddenColumns,
    sortModel,
    page,
    pageSize,
    searchQuery,
    filters,
    setHiddenColumns,
    setSortModel,
    setPage,
    setPageSize,
    setSearchQuery,
    setFilters,
  } = useGridUrlState();

  // Handle column visibility changes
  const handleColumnVisibilityChanged = useCallback((params: { column: Column; visible: boolean }[]) => {
    if (!columnApi) return;

    const newHiddenColumns = params
      .filter(({ visible }) => !visible)
      .map(({ column }) => column.getColId());

    setHiddenColumns(newHiddenColumns);
  }, [columnApi, setHiddenColumns]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!applications.length) return null;
    
    const totalApplications = applications.length;
    const applicationsWithOffers = applications.filter(app => 
      parseInt(app.offersInHand) > 0
    ).length;
    const highMatchApplications = applications.filter(app => 
      app.matchPercentage >= 80
    ).length;
    const willingToRelocate = applications.filter(app => 
      app.willingToRelocate
    ).length;
    
    return {
      total: totalApplications,
      applicationsWithOffers,
      highMatchApplications,
      willingToRelocate,
      offersPercent: Math.round((applicationsWithOffers / totalApplications) * 100),
      matchPercent: Math.round((highMatchApplications / totalApplications) * 100),
      relocatePercent: Math.round((willingToRelocate / totalApplications) * 100),
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
          // Apply sort model from URL
          if (sortModel && sortModel.length > 0) {
            columnApi.applyColumnState({
              state: sortModel.map((sort: any) => ({
                colId: sort.colId,
                sort: sort.sort || null,
              })),
              applyOrder: true,
            });
          }

          // Apply filters from URL
          if (filters && Object.keys(filters).length > 0) {
            gridApi.setFilterModel(filters);
          }

          // Apply search query
          if (searchQuery) {
            gridApi.setGridOption('quickFilterText', searchQuery);
          }
        }
      } catch (error) {
        console.error('Error loading applications:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [gridApi, columnApi, sortModel, filters, searchQuery]);

  // Define column definitions - Community Edition only
  const columnDefs = useMemo<ColDef[]>(() => {
    // Get all unique skill names from the data
    const allSkills = Array.from(
      new Set(
        applications.flatMap(app => 
          app.skills?.map(skill => skill.name) || []
        )
      )
    ).sort();

    // Generate skill columns
    const skillColumns: ColDef[] = allSkills.map(skillName => ({
      headerName: skillName,
      field: `skill_${skillName}`,
      width: 150,
      filter: 'agTextColumnFilter',
      sortable: true,
      valueGetter: (params: ValueGetterParams) => {
        const skills = params.data?.skills as Skill[] | undefined;
        const skill = skills?.find(s => s.name === skillName);
        return skill ? `${skill.years} yrs` : '';
      },
      headerClass: 'font-medium',
      cellClass: 'text-center',
    }));

    // Base columns (excluding the original skills column)
    const baseColumns: ColDef[] = [
      {
        headerName: 'ID',
        field: 'id',
        width: 120,
        filter: 'agNumberColumnFilter',
        sortable: true,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerClass: 'bg-gray-50 dark:bg-gray-800/50 font-medium text-sm uppercase tracking-wider text-gray-600 dark:text-gray-300',
        cellClass: 'font-mono text-sm',
      },
      {
        field: 'name',
        headerName: 'Name ↕',
        filter: 'agTextColumnFilter',
        width: 200,
        sortable: true,
        headerClass: 'font-medium',
        cellClass: 'text-ellipsis overflow-hidden',
      },
      {
        field: 'email',
        headerName: 'Email ↕',
        filter: 'agTextColumnFilter',
        width: 240,
        sortable: true,
        headerClass: 'font-medium',
        cellClass: 'text-ellipsis overflow-hidden',
      },
      {
        field: 'phone',
        headerName: 'Phone ↕',
        filter: 'agTextColumnFilter',
        width: 150,
        sortable: true,
        headerClass: 'font-medium',
      },
      {
        field: 'location',
        headerName: 'Location ↕',
        filter: 'agTextColumnFilter',
        width: 160,
        sortable: true,
        headerClass: 'font-medium',
      },
      {
        field: 'employer',
        headerName: 'Employer ↕',
        filter: 'agTextColumnFilter',
        width: 180,
        sortable: true,
        headerClass: 'font-medium',
        cellClass: 'text-ellipsis overflow-hidden',
      },
      {
        field: 'overallExperience',
        headerName: 'Experience ↕',
        filter: 'agNumberColumnFilter',
        width: 140,
        sortable: true,
        type: 'numericColumn',
        headerClass: 'font-medium',
        cellClass: 'text-right',
        valueFormatter: (params: { value?: string | null }) =>
          params.value ? `${params.value} years` : '',
      },
      {
        field: 'currentWorkType',
        headerName: 'Current Work ↕',
        filter: 'agTextColumnFilter',
        width: 140,
        sortable: true,
        headerClass: 'font-medium',
      },
      {
        field: 'preferredWorkType',
        headerName: 'Preferred Work ↕',
        filter: 'agTextColumnFilter',
        width: 140,
        sortable: true,
        headerClass: 'font-medium',
      },
      {
        field: 'ctc',
        headerName: 'Current CTC ↕',
        filter: 'agNumberColumnFilter',
        width: 150,
        sortable: true,
        type: 'numericColumn',
        headerClass: 'font-medium',
        cellClass: 'text-right',
        valueFormatter: (params: { value?: string | null }) =>
          params.value ? `₹${params.value} LPA` : '',
      },
      {
        field: 'expectedCTC',
        headerName: 'Expected CTC ↕',
        filter: 'agNumberColumnFilter',
        width: 150,
        sortable: true,
        type: 'numericColumn',
        headerClass: 'font-medium',
        cellClass: 'text-right',
        valueFormatter: (params: { value?: string | null }) =>
          params.value ? `₹${params.value} LPA` : '',
      },
      {
        field: 'applicationStatus',
        headerName: 'Status ↕',
        filter: 'agTextColumnFilter',
        width: 140,
        sortable: true,
        headerClass: 'font-medium',
        cellRenderer: (params: ICellRendererParams) => {
          const status = params.value;
          const statusColors = {
            'Applied': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'In Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'Interview': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
            'Offer': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
          };
          return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}">${status}</span>`;
        },
      },
      {
        field: 'matchPercentage',
        headerName: 'Match % ↕',
        filter: 'agNumberColumnFilter',
        width: 120,
        sortable: true,
        type: 'numericColumn',
        headerClass: 'font-medium',
        cellClass: 'text-right',
        valueFormatter: (params: { value?: number | null }) =>
          params.value !== undefined && params.value !== null ? `${params.value}%` : '',
      },
      {
        field: 'createdAt',
        headerName: 'Applied Date ↕',
        filter: 'agDateColumnFilter',
        width: 140,
        sortable: true,
        headerClass: 'font-medium',
        valueFormatter: (params: { value?: string | null }) =>
          params.value ? new Date(params.value).toLocaleDateString() : '',
      },
      // Original skills column is removed - replaced with individual skill columns
    ];

    return [...baseColumns, ...skillColumns];
  }, [applications]);

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
      setSortModel(newSortModel);
    };
    
    const handleFilterChanged = () => {
      const filterModel = api.getFilterModel();
      setFilters(filterModel);
    };
    
    const handleColumnStateChanged = () => {
      const columnStates = columnApi.getColumnState();
      const hiddenColumns = columnStates
        .filter((col: any) => col.hide) // Get columns that are hidden
        .map((col: any) => col.colId);
      setHiddenColumns(hiddenColumns);
    };
    
    api.addEventListener('sortChanged', handleSortChanged);
    api.addEventListener('filterChanged', handleFilterChanged);
    columnApi.addEventListener('columnVisible', handleColumnStateChanged);
    
    // Cleanup function
    return () => {
      api.removeEventListener('sortChanged', handleSortChanged);
      api.removeEventListener('filterChanged', handleFilterChanged);
      columnApi.removeEventListener('columnVisible', handleColumnStateChanged);
    };
  }, [setSortModel, setFilters, setHiddenColumns]);

  // Set initial search query from URL
  useEffect(() => {
    if (gridApi && !loading && searchQuery) {
      gridApi.setGridOption('quickFilterText', searchQuery);
    }
  }, [gridApi, loading, searchQuery]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (gridApi) {
      gridApi.setGridOption('quickFilterText', value);
    }
  };

  const onPaginationChanged = useCallback(() => {
    if (gridApi) {
      const currentPage = gridApi.paginationGetCurrentPage() + 1; // AG Grid is 0-indexed
      const pageSize = gridApi.paginationGetPageSize();
      setPage(currentPage);
      setPageSize(pageSize);
    }
  }, [gridApi, setPage, setPageSize]);

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
    paginationPageSize: pageSize,
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
    console.log('CSV Export clicked, applications length:', applications.length);
    if (!applications.length) {
      console.warn('No applications to export');
      return;
    }

    setExportLoading(true);
    try {
      console.log('Starting CSV export with', applications.length, 'applications');
      exportToCSV(applications, {
        filename: `applications-${new Date().toISOString().split('T')[0]}`,
        includeSkills: true,
        dateFormat: 'short'
      });
      console.log('CSV export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  }, [applications]);

  // Handle export to Excel
  const handleExportExcel = useCallback(() => {
    console.log('Excel Export clicked, applications length:', applications.length);
    if (!applications.length) {
      console.warn('No applications to export');
      return;
    }

    setExportLoading(true);
    try {
      console.log('Starting Excel export with', applications.length, 'applications');
      exportToExcel(applications, {
        filename: `applications-${new Date().toISOString().split('T')[0]}`,
        includeSkills: true,
        dateFormat: 'short'
      });
      console.log('Excel export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  }, [applications]);

  // Handle export to PDF
  const handleExportPDF = useCallback(() => {
    console.log('PDF Export clicked, applications length:', applications.length);
    if (!applications.length) {
      console.warn('No applications to export');
      return;
    }

    setExportLoading(true);
    try {
      console.log('Starting PDF export with', applications.length, 'applications');
      exportToPDF(applications, {
        filename: `applications-${new Date().toISOString().split('T')[0]}`,
        includeSkills: true,
        dateFormat: 'short'
      });
      console.log('PDF export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  }, [applications]);

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
            title="All Submissions" 
            value={stats.total} 
            icon={FileText} 
            className="shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-card/80 border border-border/50 hover:scale-[1.02] dark:bg-[#262b34] dark:border-[#343a46] dark:shadow-inner"
          />
          <StatsCard 
            title="Active Applications" 
            value={`${stats.highMatchApplications} (${stats.matchPercent}%)`} 
            icon={Target}
            trend="up"
            trendValue="80%"
            className="shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-card/80 border border-border/50 hover:scale-[1.02] dark:bg-[#262b34] dark:border-[#343a46] dark:shadow-inner"
          />
          <StatsCard 
            title="Offers Received" 
            value={`${stats.applicationsWithOffers} (${stats.offersPercent}%)`} 
            icon={MessageCircle}
            trend="up"
            trendValue="23%"
            className="shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-card/80 border border-border/50 hover:scale-[1.02] dark:bg-[#262b34] dark:border-[#343a46] dark:shadow-inner"
          />
          <StatsCard 
            title="Open to Relocate" 
            value={`${stats.willingToRelocate} (${stats.relocatePercent}%)`} 
            icon={Clock}
            trend="up"
            trendValue="95%"
            className="shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-card/80 border border-border/50 hover:scale-[1.02] dark:bg-[#262b34] dark:border-[#343a46] dark:shadow-inner"
          />
        </div>
      )}

      {/* Grid Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Find by company name, role, or location..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={handleSearch}
          />
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <ColumnVisibility
              columnDefs={columnDefs}
              onColumnVisibilityChanged={handleColumnVisibilityChanged}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={exportLoading}
                >
                  {exportLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent" />
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Export</span>
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV} disabled={exportLoading || !applications.length}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export as CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel} disabled={exportLoading || !applications.length}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>Export as Excel</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} disabled={exportLoading || !applications.length}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Export as PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button size="sm" className="gap-2 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
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
          onPaginationChanged={onPaginationChanged}
          modules={modules}
          loadingOverlayComponent="customLoadingOverlay"
          noRowsOverlayComponent="customNoRowsOverlay"
          className="w-full h-full ag-theme-custom"
          // Enable animations
          animateRows={true}
          // Enable pagination
          pagination={true}
          paginationPageSize={pageSize}
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

// Export with client-side only rendering to prevent hydration issues
export function ApplicationsGrid() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
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

  return <ApplicationsGridClient />;
}
