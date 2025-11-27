import { renderHook, act } from "@testing-library/react-native";
import { UserProvider, useUser } from "@/contexts/UserContext";

// Mock Firebase Auth and Firestore
jest.mock("@/lib/firebase", () => ({
  auth: {
    onAuthStateChanged: jest.fn((callback) => {
      // Simulate no authenticated user
      callback(null);
      return jest.fn(); // unsubscribe function
    }),
  },
  db: {},
}));

// Mock userService
jest.mock("@/services/userService", () => ({
  getUserData: jest.fn(),
  updateUserData: jest.fn(),
}));

describe("UserContext", () => {
  // Helper function to render the hook with provider
  const setup = () => renderHook(() => useUser(), { wrapper: UserProvider });

  it("has correct initial values", () => {
    const { result } = setup();

    // userData is null when no user is authenticated
    expect(result.current.userData).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("cannot update when no user is authenticated", () => {
    const { result } = setup();

    act(() => {
      result.current.updateUserData({ firstName: "Test User" });
    });

    // userData should still be null since no user is authenticated
    expect(result.current.userData).toBeNull();
  });

  it("has updateUserData function available", () => {
    const { result } = setup();

    expect(typeof result.current.updateUserData).toBe("function");
  });

  it("has refreshUserData function available", () => {
    const { result } = setup();

    expect(typeof result.current.refreshUserData).toBe("function");
  });

  it("throws error when used outside provider", () => {
    // Suppress console.error for cleaner test output
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useUser());
    }).toThrow("useUser must be used within a UserProvider");

    consoleError.mockRestore();
  });
});
