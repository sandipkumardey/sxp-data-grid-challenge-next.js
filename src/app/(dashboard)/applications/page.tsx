'use client';

import { useState, useEffect, useTransition } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Plus, Download, RefreshCw, Settings, X, Check, ListPlus, Trash2 } from 'lucide-react';
import { MetricCard } from '@/components/ui/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataGridSkeleton } from '@/components/ui/data-grid-skeleton';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Dynamically import the ApplicationsGrid component with SSR disabled
const ApplicationsGrid = dynamic(
  () => import('@/features/applications/components/ApplicationsGrid').then(mod => mod.ApplicationsGrid),
  { 
    ssr: false, 
    loading: () => (
      <div className="space-y-6">
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
    )
  }
);

// Mock data for metrics
const metrics = [
  { title: 'Total Applications', value: '1,248', change: 12 },
  { title: 'In Progress', value: '342', change: 5 },
  { title: 'Interview Stage', value: '89', change: -2 },
  { title: 'Offers', value: '24', change: 8 },
];

const statusOptions = ['Applied', 'Phone Screen', 'Technical Interview', 'Onsite', 'Offer', 'Rejected'];

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  // Import the sample applications data
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load the sample data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/sample-applications.json');
        const data = await response.json();
        
        // Transform the data to match our expected format
        const formattedData = data.map((app: any, index: number) => ({
          id: app.id,
          name: app.name,
          position: app.jobTitle || `Position ${index + 1}`,
          status: app.applicationStatus || 'Applied',
          date: app.createdAt || new Date().toISOString().split('T')[0],
          location: app.location || 'Remote',
          experience: app.overallExperience || '0',
          noticePeriod: app.noticePeriod || '0',
          skills: (app.skills || []).map((s: any) => s.name).join(', ')
        }));
        
        setApplications(formattedData);
      } catch (error) {
        console.error('Error loading applications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const toggleStatus = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleExport = () => {
    setIsExporting(true);
    // Simulate export delay
    setTimeout(() => {
      setIsExporting(false);
      // Show success message or trigger download
    }, 1500);
  };

  const filteredData = applications.filter(row => {
    const matchesSearch = searchQuery === '' || 
      Object.entries(row).some(([key, val]) => {
        // Skip searching by id
        if (key === 'id') return false;
        // Handle potential null/undefined values
        if (val == null) return false;
        // Convert to string and search
        return String(val).toLowerCase().includes(searchQuery.toLowerCase());
      });
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(row.status);
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-mono">
            JOB APPLICATIONS
          </h1>
          <p className="text-muted-foreground">
            View and manage job applications with filtering, sorting, and export capabilities
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 transition-colors">
                <Plus className="h-4 w-4" />
                <span>Add Application</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Add a new job application</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
          />
        ))}
      </div>

      {/* Toolbar */}
      <Card className="border-l-0 border-r-0 rounded-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search applications..."
                className="pl-10 font-mono text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search applications"
              />
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      aria-expanded={isFilterOpen}
                      aria-controls="filter-panel"
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Filter{selectedStatus.length > 0 && ` (${selectedStatus.length})`}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Filter applications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExport}
                      disabled={isExporting}
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          <span>Exporting...</span>
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Export</span>
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Export applications data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" disabled={isPending}>
                      <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
                      <span className="sr-only">Refresh</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Refresh data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">Settings</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>View settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Filter Panel - Conditionally rendered */}
          {isFilterOpen && (
            <div 
              id="filter-panel"
              className="mt-4 p-4 border rounded-lg bg-muted/10 transition-all duration-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter by Status
                  </h3>
                  <div className="space-y-2">
                    {statusOptions.map((status) => (
                      <div key={status} className="flex items-center group">
                        <input
                          type="checkbox"
                          id={`status-${status}`}
                          checked={selectedStatus.includes(status)}
                          onChange={() => toggleStatus(status)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-colors"
                        />
                        <label 
                          htmlFor={`status-${status}`} 
                          className="ml-2 text-sm cursor-pointer hover:text-foreground transition-colors"
                        >
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium mb-3">Date Range</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="from-date" className="block text-sm font-medium mb-1">
                        From
                      </label>
                      <Input 
                        type="date" 
                        id="from-date" 
                        className="font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="to-date" className="block text-sm font-medium mb-1">
                        To
                      </label>
                      <Input 
                        type="date" 
                        id="to-date" 
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedStatus.length > 0 && (
                <div className="mt-4 pt-3 border-t flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedStatus([])}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center"
                  >
                    <X className="mr-1 h-3.5 w-3.5" />
                    Clear filters
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {filteredData.length} applications found
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold tracking-tight">Overview</CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">1-{filteredData.length}</span> of{' '}
              <span className="font-medium">{filteredData.length}</span> applications
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredData.length > 0 ? (
            <div className="divide-y">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/20 text-sm font-medium text-muted-foreground border-b">
                <div className="col-span-1">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={selectedRows.length === filteredData.length}
                    onChange={(e) => {
                      setSelectedRows(e.target.checked ? filteredData.map(row => row.id) : []);
                    }}
                  />
                </div>
                <div className="col-span-3">COMPANY</div>
                <div className="col-span-3">POSITION</div>
                <div className="col-span-2">STATUS</div>
                <div className="col-span-2">DATE</div>
                <div className="col-span-1">ACTIONS</div>
              </div>
              
              {/* Table Rows */}
              <div className="divide-y">
                {filteredData.map((row) => (
                  <div 
                    key={row.id}
                    className={cn(
                      "grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-muted/10 transition-colors",
                      selectedRows.includes(row.id) && "bg-primary/5"
                    )}
                  >
                    <div className="col-span-1">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleRowSelection(row.id)}
                      />
                    </div>
                    <div className="col-span-3 font-medium">{row.company}</div>
                    <div className="col-span-3 text-muted-foreground">{row.position}</div>
                    <div className="col-span-2">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        row.status === 'Offer' 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : row.status === 'Rejected'
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                      )}>
                        {row.status}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">{row.date}</div>
                    <div className="col-span-1 flex justify-end">
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        <Settings className="h-4 w-4" />
                        <span className="sr-only">Settings</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No applications found</h3>
              <p className="text-muted-foreground max-w-md px-4">
                {searchQuery || selectedStatus.length > 0 
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first job application"}
              </p>
              {(!searchQuery && selectedStatus.length === 0) && (
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Application
                </Button>
              )}
            </div>
          )}
        </CardContent>
        
        {/* Bulk Actions Bar */}
        {selectedRows.length > 0 && (
          <div className="border-t bg-muted/20 px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{selectedRows.length}</span> selected
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Check className="h-4 w-4" />
                <span>Update Status</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <ListPlus className="h-4 w-4" />
                <span>Add to List</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span>Delete Selected</span>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Empty State - Uncomment and use when needed */}
      {/* 
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No applications yet</h3>
        <p className="mt-2 text-muted-foreground">
          Get started by adding your first job application
        </p>
        <Button className="mt-4">
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Button>
      </div>
      */}
    </div>
  );
}
