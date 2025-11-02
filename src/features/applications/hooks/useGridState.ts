import { useQueryState } from 'nuqs';
import { GridState, SortModel, FilterModel } from '../types/application';

const DEFAULT_PAGE_SIZE = 20;

type ColumnState = any; // Define proper type if needed

// Default grid state
const defaultGridState: GridState = {
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

// Custom JSON parser with type safety
const parseJson = <T>(defaultValue: T) => ({
  parse: (value: string | null) => {
    if (!value) return defaultValue;
    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  },
  serialize: (value: T) => JSON.stringify(value)
});

// Helper to get non-null value or default
const getValue = <T>(value: T | null, defaultValue: T): T => {
  return value !== null ? value : defaultValue;
};

export function useGridState() {
  // State for sort model
  const [sortModel, setSortModel] = useQueryState<SortModel>(
    'sort',
    parseJson<SortModel>(defaultGridState.sortModel)
  );
  
  // State for filter model
  const [filterModel, setFilterModel] = useQueryState<FilterModel>(
    'filter',
    parseJson<FilterModel>(defaultGridState.filterModel)
  );
  
  // State for column state
  const [columnState, setColumnState] = useQueryState<ColumnState>(
    'columns',
    parseJson<ColumnState>(defaultGridState.columnState)
  );
  
  // State for pagination
  const [pageSize, setPageSize] = useQueryState<number>(
    'pageSize',
    {
      parse: (v: string | null) => v ? parseInt(v, 10) : defaultGridState.pagination.pageSize,
      serialize: (v: number) => v.toString()
    }
  );
  
  const [currentPage, setCurrentPage] = useQueryState<number>(
    'page',
    {
      parse: (v: string | null) => v ? parseInt(v, 10) : defaultGridState.pagination.currentPage,
      serialize: (v: number) => v.toString()
    }
  );
  
  // State for search query
  const [searchQuery, setSearchQuery] = useQueryState<string>(
    'search',
    {
      parse: (v: string | null) => v || defaultGridState.searchQuery,
      serialize: (v: string) => v
    }
  );

  // Combined state with null checks
  const state: GridState = {
    sortModel: sortModel || defaultGridState.sortModel,
    filterModel: filterModel || defaultGridState.filterModel,
    columnState: columnState || defaultGridState.columnState,
    columnGroupState: [], // Not currently synced to URL
    pagination: {
      pageSize: getValue(pageSize, defaultGridState.pagination.pageSize),
      currentPage: getValue(currentPage, defaultGridState.pagination.currentPage),
    },
    searchQuery: searchQuery || defaultGridState.searchQuery,
  };

  // Update function that handles partial updates
  const updateState = (updates: Partial<GridState> | ((prev: GridState) => Partial<GridState>)) => {
    const updateObject = typeof updates === 'function' ? updates(state) : updates;

    // Update each piece of state individually to trigger minimal re-renders
    if (updateObject.sortModel !== undefined) {
      setSortModel(updateObject.sortModel);
    }
    
    if (updateObject.filterModel !== undefined) {
      setFilterModel(updateObject.filterModel);
    }
    
    if (updateObject.columnState !== undefined) {
      setColumnState(updateObject.columnState);
    }
    
    if (updateObject.pagination !== undefined) {
      if (updateObject.pagination.pageSize !== undefined) {
        setPageSize(updateObject.pagination.pageSize);
      }
      if (updateObject.pagination.currentPage !== undefined) {
        setCurrentPage(updateObject.pagination.currentPage);
      }
    }
    
    if (updateObject.searchQuery !== undefined) {
      setSearchQuery(updateObject.searchQuery);
    }
  };

  return [state, updateState] as const;
}
