// Mock state
let mockSearchParams = new URLSearchParams();
const mockPush = jest.fn((url) => {
  const queryString = url.split('?')[1] || '';
  mockSearchParams = new URLSearchParams(queryString);
  return Promise.resolve();
});

// Helper function to create state with getter and setter
const createState = (key, defaultValue, transform = (v) => v) => {
  let value = defaultValue;
  
  // Get initial value from URL if it exists
  if (mockSearchParams.has(key)) {
    const param = mockSearchParams.get(key);
    if (Array.isArray(defaultValue)) {
      value = param ? param.split(',').map(v => v.trim()) : defaultValue;
    } else if (typeof defaultValue === 'number') {
      value = param ? parseInt(param, 10) : defaultValue;
    } else if (typeof defaultValue === 'boolean') {
      value = param === 'true';
    } else {
      value = param || defaultValue;
    }
  }

  return {
    get value() {
      return transform(value);
    },
    setValue: (newValue) => {
      value = newValue;
      if (newValue === null || newValue === undefined || newValue === '') {
        mockSearchParams.delete(key);
      } else if (Array.isArray(newValue)) {
        mockSearchParams.set(key, newValue.join(','));
      } else {
        mockSearchParams.set(key, String(newValue));
      }
      return mockPush(`?${mockSearchParams.toString()}`);
    }
  };
};

// Mock implementations for nuqs
const parseAsString = {
  withDefault: (defaultValue) => createState('searchQuery', defaultValue)
};

const parseAsInteger = {
  withDefault: (defaultValue) => createState('page', defaultValue, v => v)
};

const parseAsArrayOf = (type) => ({
  withDefault: (defaultValue) => {
    const key = type === parseAsString ? 'skills' : 'hiddenColumns';
    return createState(key, defaultValue);
  }
});

const useQueryState = (key, options = {}) => {
  const defaultValue = options.defaultValue;
  let transform = (v) => v;
  
  if (typeof defaultValue === 'number') {
    transform = (v) => Number(v);
  } else if (Array.isArray(defaultValue)) {
    transform = (v) => Array.isArray(v) ? v : [];
  } else if (typeof defaultValue === 'boolean') {
    transform = (v) => v === 'true' || v === true;
  }

  return createState(key, defaultValue, transform);
};

const useQueryStates = (states) => {
  const result = {};
  Object.entries(states).forEach(([key, config]) => {
    result[key] = useQueryState(key, config);
  });
  return [result, mockPush];
};

// Reset function for tests
const reset = () => {
  mockSearchParams = new URLSearchParams();
  mockPush.mockClear();
};

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: mockPush,
    replace: mockPush,
  })
}));

module.exports = {
  useQueryState,
  useQueryStates,
  parseAsString,
  parseAsInteger,
  parseAsArrayOf,
  __reset: reset
};
