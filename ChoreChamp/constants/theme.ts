/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

import { Platform } from 'react-native';


export const Colors = {
  light: {
    // Text
    text: '#11181C',
    darkText: '#11181C',
    lightText: '#687076',
    lightDarkText: '#333333ff',
    activeText: '#FFBE00',
    lightNonInteractiveText: '#9CA3AF',
    darkNonInteractiveText: '#374151',

    // Background
    background: '#FFFFF7',
    contextBackground: '#fff',
    interactiveBackground: '#FEF3C7',
    nonInteractiveBackground: '#F3F4F6',

    // Accent
    tint: '#FFBE00',

    // Icons
    icon: '#687076',

    // Tabs
    tabIconDefault: '#676D75',
    tabIconSelected: '#FFBE00',
    tabBarBackground: '#FFFFFF',

    // Status codes
    statusSuccessBackground: '#00FF9433',
    statusSuccessText: '#5DC486',
    statusFailedBackground: '#FF000033',
    statusFailedText: '#C45D5D',

    // Pure colors
    white: '#FFFFFF',
    black: '#000000',
  },
  dark: {
    // Text
    text: '#ECEDEE',
    darkText: '#11181C',
    lightText: '#333333ff',
    lightDarkText: '#676D75',
    activeText: '#FFBE00',
    lightNonInteractiveText: '#838383',
    darkNonInteractiveText: '#000',

    // Background
    background: '#121212',
    contextBackground: '#1E1F21',
    interactiveBackground: '#FF9595',
    nonInteractiveBackground: '#353535',

    // Accent
    tint: '#FFBE00',

    // Icons
    icon: '#9BA1A6',

    // Tabs
    tabIconDefault: '#676D75',
    tabIconSelected: '#FFBE00',
    tabBarBackground: '#1E1F21',

    // Status codes
    statusSuccessBackground: '#00FF9433',
    statusSuccessText: '#5DC486',
    statusFailedBackground: '#FF000033',
    statusFailedText: '#C45D5D',

    // Pure colors
    white: '#FFFFFF',
    black: '#000000',
  }
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
