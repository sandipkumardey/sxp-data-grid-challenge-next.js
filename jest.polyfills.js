// Polyfill for requestAnimationFrame
/* eslint-disable no-undef */
// $FlowFixMe
window.requestAnimationFrame = function(callback) {
  // Using setTimeout as a fallback
  return setTimeout(callback, 0);
};

// Polyfill for cancelAnimationFrame
window.cancelAnimationFrame = function(id) {
  clearTimeout(id);
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverStub;
