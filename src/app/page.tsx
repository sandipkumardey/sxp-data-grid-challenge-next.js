'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { DataGrid } from '@/components/data-grid/DataGrid';
import { SearchInput } from '@/components/data-grid/SearchInput';
import type { ColDef } from '@ag-grid-community/core';
import applications from '../../sample-applications.json';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';
import { Filter, X, Grid } from 'lucide-react'; // Added Grid import (it was missing)
import { ErrorBoundary } from '@/components/ErrorBoundary'; // ✅ Ensure this import exists
import { useGridState } from '@/hooks/useGridState';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ✅ Moved your main logic here
export function JobApplicationsPage() {
  const [gridState, setGridState] = useGridState();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  // Initialize from URL (nuqs) and keep in sync via effects
  useEffect(() => {
    if (gridState.searchQuery !== searchQuery) {
      setSearchQuery(gridState.searchQuery);
    }
  }, [gridState.searchQuery, searchQuery]);

  useEffect(() => {
    const urlSkills = new Set(gridState.skills || []);
    if (urlSkills.size !== selectedSkills.size || Array.from(urlSkills).some(s => !selectedSkills.has(s))) {
      setSelectedSkills(urlSkills);
    }
  }, [gridState.skills, selectedSkills]);

  // Get all unique skills
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    applications.forEach(app => {
      app.skills.forEach(skill => {
        skills.add(skill.name);
      });
    });
    return Array.from(skills).sort();
  }, []);

  // column visibility derived from hiddenColumns in URL (include dynamic skill columns)
  useEffect(() => {
    const hiddenSet = new Set(gridState.hiddenColumns || []);
    const computed: Record<string, boolean> = {};
    [ 'name','email','phone','location','ctc','expectedCTC','noticePeriod','applicationStatus','preferredWorkType', ...allSkills.map(s=>`skill_${s}`) ].forEach(field => {
      computed[field] = !hiddenSet.has(field);
    });
    if (JSON.stringify(columnVisibility) !== JSON.stringify(computed)) {
      setColumnVisibility(computed);
    }
  }, [gridState.hiddenColumns, allSkills, columnVisibility]);

  // Get all column definitions
  const columnDefs = useMemo<ColDef[]>(() => {
    const baseColumns: ColDef[] = [
      { 
        field: 'name', 
        headerName: 'Name', 
        pinned: 'left', 
        width: 200,
        filter: 'agTextColumnFilter',
        filterParams: {
          filterOptions: ['contains', 'notContains'],
          suppressAndOrCondition: true,
        },
      },
      { field: 'email', headerName: 'Email', width: 250, filter: 'agTextColumnFilter' },
      { field: 'phone', headerName: 'Phone', width: 150, filter: 'agTextColumnFilter' },
      { field: 'location', headerName: 'Location', width: 150, filter: 'agSetColumnFilter' },
      { field: 'ctc', headerName: 'CTC (LPA)', width: 120, filter: 'agNumberColumnFilter' },
      { field: 'expectedCTC', headerName: 'Expected CTC (LPA)', width: 150, filter: 'agNumberColumnFilter' },
      { field: 'noticePeriod', headerName: 'Notice Period', width: 140, filter: 'agNumberColumnFilter' },
      { 
        field: 'applicationStatus', 
        headerName: 'Status', 
        width: 150, 
        filter: 'agSetColumnFilter',
        cellRenderer: StatusBadgeRenderer,
      },
      { field: 'preferredWorkType', headerName: 'Work Type', width: 140, filter: 'agSetColumnFilter' },
    ];

    const skillColumns: ColDef[] = allSkills.map(skill => ({
      field: `skill_${skill}`,
      headerName: skill,
      width: 150,
      valueFormatter: ({ value }: { value: unknown }) => (value ? `${value as string} yrs` : '-'),
      filter: 'agNumberColumnFilter',
    }));

    return [...baseColumns, ...skillColumns];
  }, [allSkills]);

  // Flatten skills into columns and apply filters
  const flattenedData = useMemo(() => {
    return applications
      .filter(app => {
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          return (
            app.name.toLowerCase().includes(searchLower) ||
            app.email.toLowerCase().includes(searchLower) ||
            app.phone.toLowerCase().includes(searchLower) ||
            app.location.toLowerCase().includes(searchLower) ||
            app.applicationStatus.toLowerCase().includes(searchLower) ||
            app.skills.some(skill => skill.name.toLowerCase().includes(searchLower))
          );
        }
        return true;
      })
      .filter(app => {
        if (selectedSkills.size > 0) {
          const appSkills = new Set(app.skills.map(s => s.name));
          return Array.from(selectedSkills).every(skill => appSkills.has(skill));
        }
        return true;
      })
      .map(app => {
        const skillsObj = app.skills.reduce((acc, skill) => {
          acc[`skill_${skill.name}`] = skill.years;
          return acc;
        }, {} as Record<string, string>);
        
        return { ...app, ...skillsObj };
      });
  }, [searchQuery, selectedSkills]);

  // Toggle skill filter
  const toggleSkillFilter = useCallback((skill: string) => {
    setSelectedSkills(prev => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill); else next.add(skill);
      // persist to URL
      setGridState({ skills: Array.from(next) });
      return next;
    });
  }, [setGridState]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedSkills(new Set());
    setGridState({
      searchQuery: '',
      skills: [],
    });
  }, [setGridState]);

  return (
    <main className="container mx-auto py-8 px-4 bg-gradient-to-b from-background to-muted/30">
      <Card>
        <CardHeader className="sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div>
            <CardTitle>Job Applications</CardTitle>
            <CardDescription>Manage and filter job applications with advanced data grid</CardDescription>
          </div>
          <Toolbar />
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="w-full sm:w-96">
              <SearchInput 
                placeholder="Search applications..." 
                onSearch={(q) => {
                  setSearchQuery(q);
                  setGridState({ searchQuery: q });
                }}
                value={searchQuery}
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
              {/* Page size selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page</span>
                <Select
                  value={String(gridState.paginationPageSize)}
                  onValueChange={(v) => setGridState({ paginationPageSize: Number(v), paginationPage: 0 })}
                >
                  <SelectTrigger className="h-8 w-[100px]">
                    <SelectValue placeholder="20" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectGroup>
                      <SelectLabel>Page size</SelectLabel>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Skills Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Skills
                    {selectedSkills.size > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedSkills.size}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-h-96 overflow-y-auto">
                  <DropdownMenuLabel>Filter by Skills</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {allSkills.map(skill => (
                    <DropdownMenuCheckboxItem
                      key={skill}
                      checked={selectedSkills.has(skill)}
                      onCheckedChange={() => toggleSkillFilter(skill)}
                    >
                      {skill}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Column Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Grid className="h-4 w-4" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columnDefs.map(column => (
                    <DropdownMenuCheckboxItem
                      key={String(column.field)}
                      checked={columnVisibility[String(column.field)] !== false}
                      onCheckedChange={(value) => {
                        const field = String(column.field);
                        const next = { ...columnVisibility, [field]: value as boolean };
                        setColumnVisibility(next);
                        const nextHidden = Object.entries(next)
                          .filter(([, visible]) => !visible)
                          .map(([f]) => f);
                        setGridState({ hiddenColumns: nextHidden });
                      }}
                    >
                      {column.headerName}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Clear Filters */}
              {(searchQuery || selectedSkills.size > 0) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Badges */}
          {selectedSkills.size > 0 && (
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedSkills).map(skill => (
                <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
                  {skill}
                  <button 
                    onClick={() => toggleSkillFilter(skill)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedSkills(new Set())}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Grid */}
          <div className="rounded-xl border overflow-hidden">
            <DataGrid 
              rowData={flattenedData} 
              columnDefs={columnDefs}
              columnVisibility={columnVisibility}
              searchQuery={searchQuery}
            />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function StatusBadgeRenderer(params: { value: unknown }) {
  const raw = String(params.value ?? '').toLowerCase();
  const variant: 'default' | 'secondary' | 'destructive' =
    raw === 'hired' ? 'default' : raw === 'interview' ? 'secondary' : 'destructive';
  const label = String(params.value ?? '');
  return (
    <Badge variant={variant} className="text-xs font-medium px-2 py-0.5 capitalize">
      {label}
    </Badge>
  );
}

function Toolbar() {
  const { theme, setTheme } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(next)}
            className="gap-2"
          >
            {next === 'dark' ? 'Dark' : 'Light'} mode
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle theme</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ✅ Wrap the page with an ErrorBoundary
export default function Page() {
  return (
    <ErrorBoundary>
      <JobApplicationsPage />
    </ErrorBoundary>
  );
}
