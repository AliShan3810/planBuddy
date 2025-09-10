// Jest setup file
// This file is run before each test file

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Add any global test setup here
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});
