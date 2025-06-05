import React, { createContext, useContext } from 'react';

// define the color scheme type
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

// define the theme type
type Theme = {
  light: ColorScheme;
  dark: Partial<ColorScheme>;
};

// define the base colors that will always be available
const baseColors: Theme = {
  light: {

    // text colors
    text: '#1B1C20',
    textPrimary: '#1B1C20',
    textSecondary: '#6E8CA0',
    textTertiary: '#FFFFFF',

    // background colors
    background: '#FFFFFF',
    generalBG: '#F0F3F4',
    formInputBG: '#F0F3F4',

    // tab colors
    tabIconDefault: '#324755',
    tabIconSelected: '#D97D54',

    // button colors
    buttonPrimary: '#324755',
    buttonSecondary: '#6E8CA0',

    // accent colors
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

// create the context with default values
const ThemeContext = createContext<Theme>(baseColors);

// create the provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={baseColors}>
      {children}
    </ThemeContext.Provider>
  );
}

// create a hook to use the theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // If context is not available, return the base colors
    return baseColors;
  }
  return context;
}

// export a safe version of Colors that always has a value
export const Colors = baseColors;

// export a hook for dynamic theme values
export function useColors() {
  return useTheme();
}

// export the ThemeProvider as default
export default ThemeProvider; 