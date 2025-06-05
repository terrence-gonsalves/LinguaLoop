import { createContext, useContext } from 'react';

// Define the color scheme type
type ColorScheme = {
  text: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  background: string;
  generalBG: string;
  formInputBG: string;
  tabIconDefault: string;
  tabIconSelected: string;
  buttonPrimary: string;
  buttonSecondary: string;
  rust: string;
  link: string;
  border: string;
  error: string;
  fossil: string;
};

// Define the theme type
type Theme = {
  light: ColorScheme;
  dark: Partial<ColorScheme>;
};

// Define the actual colors
const theme: Theme = {
  light: {
    // Text colors
    text: '#1B1C20',
    textPrimary: '#1B1C20',
    textSecondary: '#6E8CA0',
    textTertiary: '#FFFFFF',

    // Background colors
    background: '#FFFFFF',
    generalBG: '#F0F3F4',
    formInputBG: '#F0F3F4',

    // Tab colors
    tabIconDefault: '#324755',
    tabIconSelected: '#D97D54',

    // Button colors
    buttonPrimary: '#324755',
    buttonSecondary: '#6E8CA0',

    // Accent colors
    rust: '#D97D54',
    link: '#324755',
    border: '#E5E5E5',
    error: '#ff4b4b',
    fossil: '#C8D1D3',
  },
  dark: {
    // We'll implement dark theme later
  },
};

// Create the context
const ThemeContext = createContext<Theme>(theme);

// Create the provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

// Create a hook to use the theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Export the theme object for static usage
export const Colors = theme; 