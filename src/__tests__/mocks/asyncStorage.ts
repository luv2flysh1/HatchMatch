// Mock AsyncStorage for tests
const mockStorage: Record<string, string> = {};

const mockAsyncStorage = {
  getItem: jest.fn((key: string) => {
    return Promise.resolve(mockStorage[key] || null);
  }),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => {
    return Promise.resolve(Object.keys(mockStorage));
  }),
  multiGet: jest.fn((keys: string[]) => {
    return Promise.resolve(keys.map((key) => [key, mockStorage[key] || null]));
  }),
  multiSet: jest.fn((keyValuePairs: [string, string][]) => {
    keyValuePairs.forEach(([key, value]) => {
      mockStorage[key] = value;
    });
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys: string[]) => {
    keys.forEach((key) => delete mockStorage[key]);
    return Promise.resolve();
  }),
};

export default mockAsyncStorage;
