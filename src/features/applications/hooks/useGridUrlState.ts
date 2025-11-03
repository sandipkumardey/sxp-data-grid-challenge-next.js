'use client';

import { useQueryState, parseAsArrayOf, parseAsString, parseAsInteger, parseAsJson } from 'nuqs';

/**
 * Hook to manage URL state for the data grid using nuqs
 */
export function useGridUrlState() {
  // Column visibility
  const [hiddenColumns, setHiddenColumns] = useQueryState(
    'hidden',
    parseAsArrayOf(parseAsString).withDefault([])
  );

  // Sort model - array of {colId, sort} objects
  const [sortModel, setSortModel] = useQueryState(
    'sort',
    parseAsJson<Array<{ colId: string; sort: 'asc' | 'desc' }>>(value => {
      if (Array.isArray(value)) {
        return value.filter(item => 
          typeof item === 'object' && 
          item !== null && 
          typeof item.colId === 'string' && 
          (item.sort === 'asc' || item.sort === 'desc')
        ) as Array<{ colId: string; sort: 'asc' | 'desc' }>;
      }
      return [];
    }).withDefault([])
  );

  // Pagination
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(20));

  // Search query
  const [searchQuery, setSearchQuery] = useQueryState('q', parseAsString.withDefault(''));

  // Active filters
  const [filters, setFilters] = useQueryState(
    'filters',
    parseAsJson<Record<string, any>>(value => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return value as Record<string, any>;
      }
      return {};
    }).withDefault({})
  );

  return {
    // State
    hiddenColumns,
    sortModel,
    page,
    pageSize,
    searchQuery,
    filters,

    // Setters
    setHiddenColumns: (cols: string[]) => setHiddenColumns(cols.length ? cols : null),
    setSortModel: (model: Array<{ colId: string; sort: 'asc' | 'desc' }>) =>
      setSortModel(model.length > 0 ? model : null),
    setPage: (p: number) => setPage(p),
    setPageSize: (size: number) => setPageSize(size),
    setSearchQuery: (query: string) => setSearchQuery(query || null),
    setFilters: (filters: Record<string, any>) =>
      setFilters(Object.keys(filters).length > 0 ? filters : null),
  };
}
