'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { GridState } from '../types/application';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Hook to manage URL state for the data grid
 * @returns Object containing state and state setters
 */
// Helper to safely parse JSON from URL params
const safeJsonParse = <T,>(value: string | null, defaultValue: T): T => {
  try {
    return value ? JSON.parse(decodeURIComponent(value)) : defaultValue;
  } catch (e) {
    console.warn('Failed to parse URL param:', e);
    return defaultValue;
  }
};

export function useUrlState(): [GridState, (updates: Partial<GridState> | ((prev: GridState) => Partial<GridState>)) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  // Track client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Parse URL state in a way that's safe for SSR
  const urlState = useMemo(() => {
    const state = getDefaultGridState();
    
    if (!isClient) return state;
    
    const params = new URLSearchParams(window.location.search);

    // Parse all URL parameters in a single pass
    const sortParam = params.get('sort');
    const filterParam = params.get('filter');
    const columnStateParam = params.get('columns');
    const pageSize = params.get('pageSize');
    const currentPage = params.get('currentPage');
    const searchQuery = params.get('search');

    return {
      ...state,
      sortModel: safeJsonParse(sortParam, state.sortModel),
      filterModel: safeJsonParse(filterParam, state.filterModel),
      columnState: safeJsonParse(columnStateParam, state.columnState),
      pagination: {
        pageSize: pageSize ? Number(pageSize) : state.pagination.pageSize,
        currentPage: currentPage ? Number(currentPage) : state.pagination.currentPage,
      },
      searchQuery: searchQuery || state.searchQuery,
    };
  }, [searchParams, isClient]);

  // Update URL state
  const updateUrlState = useCallback((updates: Partial<GridState> | ((prev: GridState) => Partial<GridState>)) => {
    if (!isClient) return;

    // Get current state
    const currentState = urlState || getDefaultGridState();
    
    // Apply updates (handle both direct and functional updates)
    const updateObject = typeof updates === 'function' ? updates(currentState) : updates;
    
    // Create new URLSearchParams from current URL
    const params = new URLSearchParams(window.location.search);
    
    // Update params based on state changes
    if (updateObject.sortModel !== undefined) {
      if (updateObject.sortModel?.length) {
        params.set('sort', encodeURIComponent(JSON.stringify(updateObject.sortModel)));
      } else {
        params.delete('sort');
      }
    }

    if (updateObject.filterModel !== undefined) {
      if (updateObject.filterModel && Object.keys(updateObject.filterModel).length > 0) {
        params.set('filter', encodeURIComponent(JSON.stringify(updateObject.filterModel)));
      } else {
        params.delete('filter');
      }
    }

    if (updateObject.columnState !== undefined) {
      if (updateObject.columnState?.length) {
        params.set('columns', encodeURIComponent(JSON.stringify(updateObject.columnState)));
      } else {
        params.delete('columns');
      }
    }

    if (updateObject.pagination !== undefined) {
      const { pageSize, currentPage } = updateObject.pagination;
      if (pageSize !== undefined) {
        params.set('pageSize', pageSize.toString());
      } else {
        params.delete('pageSize');
      }
      
      if (currentPage !== undefined) {
        params.set('currentPage', currentPage.toString());
      } else {
        params.delete('currentPage');
      }
    }

    if (updateObject.searchQuery !== undefined) {
      if (updateObject.searchQuery) {
        params.set('search', updateObject.searchQuery);
      } else {
        params.delete('search');
      }
    }

    // Only update if there are actual changes
    const newSearch = params.toString();
    const currentSearch = window.location.search.replace(/^\?/, '');
    
    if (newSearch !== currentSearch) {
      // Use router.replace for client-side navigation
      router.replace(`${pathname}${newSearch ? `?${newSearch}` : ''}`, { scroll: false });
    }
  }, [pathname, router, urlState, isClient]);

  return [urlState, updateUrlState] as const;
}

function getDefaultGridState(): GridState {
  return {
    sortModel: [],
    filterModel: {},
    columnState: [],
    columnGroupState: [],
    pagination: {
      pageSize: DEFAULT_PAGE_SIZE,
      currentPage: 0,
    },
    searchQuery: '',
  };
}
