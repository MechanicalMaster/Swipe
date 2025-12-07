// Jest setup file
// This file runs after Jest is installed but before tests run

// Import custom jest-dom matchers for DOM assertions
// e.g., toBeInTheDocument(), toHaveTextContent(), etc.
import '@testing-library/jest-dom';

// Clean up after each test
afterEach(() => {
    // Clear all mocks between tests
    jest.clearAllMocks();
});

// Mock window.matchMedia for components that use media queries
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

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
};

// Mock ResizeObserver for components that use it
global.ResizeObserver = class ResizeObserver {
    constructor() { }
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
};
