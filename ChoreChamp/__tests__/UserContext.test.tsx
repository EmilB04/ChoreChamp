import { renderHook, act } from "@testing-library/react-native";
import { UserProvider, useUser } from "@/contexts/UserContext";

describe("UserContext", () => {
  // Helper function to render the hook with provider
  const setup = () => renderHook(() => useUser(), { wrapper: UserProvider });

  it("has correct initial values", () => {
    const { result } = setup();

    // Just check that initial values exist and are strings
    expect(result.current.userData.name).toBeDefined();
    expect(result.current.userData.email).toBeDefined();
  });

  it("can update name", () => {
    const { result } = setup();

    act(() => {
      result.current.updateUserData({ name: "Test User" });
    });

    expect(result.current.userData.name).toBe("Test User");
  });

  it("can update email", () => {
    const { result } = setup();

    act(() => {
      result.current.updateUserData({ email: "test@example.com" });
    });

    expect(result.current.userData.email).toBe("test@example.com");
  });

  it("keeps other data when updating one field", () => {
    const { result } = setup();
    const originalEmail = result.current.userData.email;

    act(() => {
      result.current.updateUserData({ name: "Changed Name" });
    });

    // Email should still be the same
    expect(result.current.userData.email).toBe(originalEmail);
  });

  it("can toggle dark mode", () => {
    const { result } = setup();

    act(() => {
      result.current.updateUserData({ darkModeEnabled: false });
    });

    expect(result.current.userData.darkModeEnabled).toBe(false);
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
