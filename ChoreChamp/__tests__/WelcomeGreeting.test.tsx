import React from "react";
import { render } from "@testing-library/react-native";
import WelcomeGreeting from "@/components/index/WelcomeGreeting";

// Mock ThemeContext
jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({
    colors: {
      text: "#000000",
    },
  }),
}));

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        "greeting.morning": "God morgen",
        "greeting.forenoon": "God formiddag",
        "greeting.afternoon": "God dag",
        "greeting.evening": "God kveld",
        "greeting.night": "God natt",
      };
      return translations[key] || key;
    },
  }),
}));

describe("WelcomeGreeting", () => {
  // Helper function to mock specific time
  const mockDate = (hours: number) => {
    const mockDate = new Date();
    mockDate.setHours(hours, 0, 0, 0);
    jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders "God morgen" at 5 AM', () => {
    mockDate(5);
    const { getByText } = render(<WelcomeGreeting username="Test User" />);
    getByText(/God morgen/);
    getByText(/Test User/);
  });

  it('renders "God formiddag" at 9 AM', () => {
    mockDate(9);
    const { getByText } = render(<WelcomeGreeting username="Test User" />);
    getByText(/God formiddag/);
    getByText(/Test User/);
  });

  it('renders "God dag" at 12 PM', () => {
    mockDate(12);
    const { getByText } = render(<WelcomeGreeting username="Test User" />);
    getByText(/God dag/);
    getByText(/Test User/);
  });

  it('renders "God kveld" at 6 PM', () => {
    mockDate(18);
    const { getByText } = render(<WelcomeGreeting username="Test User" />);
    getByText(/God kveld/);
    getByText(/Test User/);
  });

  it('renders "God natt" at midnight', () => {
    mockDate(0);
    const { getByText } = render(<WelcomeGreeting username="Test User" />);
    getByText(/God natt/);
    getByText(/Test User/);
  });
});
