import { renderHook, act } from '@testing-library/react';
import { useGridState } from '../useGridState';

// Mock nuqs
jest.mock('nuqs', () => {
  let state: Record<string, any> = {
    sortModel: '[]',
    filterModel: '',
    columnState: '[]',
    columnGroupState: '',
    paginationPageSize: '20',
    paginationPage: '0',
    searchQuery: '',
    hiddenColumns: '[]',
    skills: '[]',
  };

  const mockPush = jest.fn((url: string) => {
    const params = new URLSearchParams(url.split('?')[1] || '');
    params.forEach((value, key) => {
      state[key] = value;
    });
    return Promise.resolve();
  });

  const createState = <T,>(key: string, defaultValue: T, parseFn: (val: string) => T = (val) => val as unknown as T) => {
    return {
      get value(): T {
        return state[key] !== undefined ? parseFn(state[key]) : defaultValue;
      },
      setValue: (newValue: T) => {
        state[key] = typeof newValue === 'string' ? newValue : JSON.stringify(newValue);
        return mockPush(`?${key}=${encodeURIComponent(String(state[key]))}`);
      },
      options: { history: 'push', shallow: false }
    };
  };

  const createArrayState = <T,>(key: string, defaultValue: T[], parseFn: (val: string) => T = (val) => val as unknown as T) => {
    return {
      get value(): T[] {
        try {
          return state[key] ? JSON.parse(state[key]) : [...defaultValue];
        } catch (e) {
          return [...defaultValue];
        }
      },
      setValue: (newValue: T[]) => {
        state[key] = JSON.stringify(newValue);
        return mockPush(`?${key}=${encodeURIComponent(state[key])}`);
      },
      options: { history: 'push', shallow: false }
    };
  };

  const parseAsString = {
    withDefault: (defaultValue: string = '') => ({
      ...createState('searchQuery', defaultValue, (val) => val || '')
    })
  };

  const parseAsInteger = {
    withDefault: (defaultValue: number) => ({
      ...createState('paginationPage', defaultValue, (val) => val ? parseInt(val, 10) : defaultValue),
      setValue: (newValue: number) => {
        state['paginationPage'] = String(newValue);
        return mockPush(`?paginationPage=${encodeURIComponent(String(newValue))}`);
      }
    })
  };

  const parseAsArrayOf = (type: any) => ({
    withDefault: (defaultValue: any[] = []) => ({
      ...createArrayState('sortModel', defaultValue, (val: string) => {
        try {
          return val ? JSON.parse(val) : defaultValue;
        } catch (e) {
          return defaultValue;
        }
      })
    })
  });

  const useQueryStates = (states: Record<string, any>, options: any) => {
    const result: Record<string, any> = {};
    const stateUpdaters: Record<string, (value: any) => Promise<void>> = {};
    
    // Check URL params first
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const urlParams = new URLSearchParams(search);
    
    // Initialize with default values
    Object.entries(states).forEach(([key, config]) => {
      const stateKey = config.key || key;
      const urlValue = urlParams.get(stateKey);
      
      // Helper function to safely get array default value
      const getArrayDefault = (val: any) => {
        if (Array.isArray(val)) return [...val];
        if (val === undefined || val === null) return [];
        return [val];
      };
      
      // Special handling for different types of state
      if (key === 'paginationPageSize' || key === 'paginationPage') {
        const defaultValue = Number.isInteger(config.defaultValue) ? config.defaultValue : 0;
        const initialValue = urlValue ? parseInt(urlValue, 10) : defaultValue;
        const state = createState(key, initialValue, (val) => val ? parseInt(val, 10) : defaultValue);
        result[key] = state.value;
        stateUpdaters[key] = state.setValue;
      } else if (key === 'sortModel' || key === 'skills' || key === 'hiddenColumns' || key === 'columnState') {
        const defaultValue = getArrayDefault(config.defaultValue);
        let initialValue;
        try {
          initialValue = urlValue ? JSON.parse(urlValue) : defaultValue;
        } catch (e) {
          initialValue = defaultValue;
        }
        const state = createArrayState(key, initialValue, (val) => {
          try {
            return val ? JSON.parse(val) : [];
          } catch (e) {
            return [];
          }
        });
        result[key] = state.value;
        stateUpdaters[key] = state.setValue;
      } else {
        const defaultValue = config.defaultValue !== undefined ? config.defaultValue : '';
        const initialValue = urlValue !== null ? urlValue : defaultValue;
        const state = createState(key, initialValue);
        result[key] = state.value;
        stateUpdaters[key] = state.setValue;
      }
    });

    // Create a setState function that updates the URL
    const setState = async (updates: Record<string, any>) => {
      const promises = Object.entries(updates).map(async ([key, value]) => {
        if (stateUpdaters[key]) {
          await stateUpdaters[key](value);
          result[key] = value;
        }
      });
      await Promise.all(promises);
    };

    return [result, setState];
  };

  const reset = () => {
    state = {
      sortModel: '[]',
      filterModel: '',
      columnState: '[]',
      columnGroupState: '',
      paginationPageSize: '20',
      paginationPage: '0',
      searchQuery: '',
      hiddenColumns: '[]',
      skills: '[]',
    };
    mockPush.mockClear();
  };

  return {
    useQueryStates,
    parseAsString,
    parseAsInteger,
    parseAsArrayOf,
    __reset: reset
  };
});

describe('useGridState', () => {
  const { __reset } = require('nuqs');

  beforeEach(() => {
    __reset();
    jest.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useGridState());
    
    expect(result.current[0]).toEqual({
      sortModel: [],
      filterModel: '',
      columnState: [],
      columnGroupState: '',
      paginationPageSize: 20,
      paginationPage: 0,
      searchQuery: '',
      hiddenColumns: [],
      skills: [],
    });
  });

  it('updates search query', async () => {
    const { result } = renderHook(() => useGridState());

    await act(async () => {
      await result.current[1]({ searchQuery: 'test' });
    });

    expect(result.current[0].searchQuery).toBe('test');
  });

  it('updates pagination', async () => {
    const { result } = renderHook(() => useGridState());

    await act(async () => {
      await result.current[1]({ 
        paginationPage: 2, 
        paginationPageSize: 10 
      });
    });

    expect(result.current[0].paginationPage).toBe(2);
    expect(result.current[0].paginationPageSize).toBe(10);
  });

  it('updates sort model', async () => {
    const { result } = renderHook(() => useGridState());
    const sortModel = ['name:asc'];

    await act(async () => {
      await result.current[1]({ sortModel });
    });

    expect(result.current[0].sortModel).toEqual(sortModel);
  });

  it('updates column state', async () => {
    const { result } = renderHook(() => useGridState());
    const columnState = JSON.stringify([{ colId: 'name', width: 200 }]);

    await act(async () => {
      await result.current[1]({ columnState });
    });

    expect(result.current[0].columnState).toEqual(columnState);
  });

  it('updates skills', async () => {
    const { result } = renderHook(() => useGridState());
    const skills = ['React', 'TypeScript'];

    await act(async () => {
      await result.current[1]({ skills });
    });

    expect(result.current[0].skills).toEqual(skills);
  });

  // Test the hook's ability to update state
  it('updates state correctly', async () => {
    const { result } = renderHook(() => useGridState());
    
    // Test updating search query
    await act(async () => {
      await result.current[1]({ searchQuery: 'test' });
    });
    expect(result.current[0].searchQuery).toBe('test');
    
    // Test updating pagination
    await act(async () => {
      await result.current[1]({ 
        paginationPage: 2, 
        paginationPageSize: 10 
      });
    });
    expect(result.current[0].paginationPage).toBe(2);
    expect(result.current[0].paginationPageSize).toBe(10);
    
    // Test updating skills
    const skills = ['React', 'TypeScript'];
    await act(async () => {
      await result.current[1]({ skills });
    });
    expect(result.current[0].skills).toEqual(skills);
  });
});
