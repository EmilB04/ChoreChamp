// Mock Expo's Winter runtime
global.__ExpoImportMetaRegistry = {};

// Mock structuredClone if not available
if (typeof global.structuredClone === "undefined") {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
