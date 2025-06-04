/**
 * Below are the colors that are used in the app.
 */

const tintColorLight = '#D97D54';
const tintColorDark = '#fff';

type ColorScheme = {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  error: string;
  success?: string;
  outLineBtnText?: string;
  link?: string;
  generalBG?: string;
  tabsBG?: string;
  textPrimary?: string;
  textSecondary?: string;
  textTertiary?: string;
  formInputBG?: string;
  formInputBorder?: string;
  borders?: string;
  grey?: string;
  black?: string;
  appBG?: string;
  sage?: string;
  rust?: string;
  drab?: string;
  ice?: string;
  fossil?: string;
  sand?: string;
};

const Colors = {
  light: {
    text: '#FFFFFF',
    background: '#fff',
    tint: tintColorLight,
    icon: '#324755',
    tabIconDefault: '#324755',
    tabIconSelected: tintColorLight,
    error: '#ff4b4b',
    success: '#4CAF50',
    outLineBtnText: '#C8D1D3',
    link: '#1cb0f6',
    generalBG: '#F7F8FB',
    tabsBG: '#6E8CA0',
    
    // typography
    textPrimary: '#1B1C20',
    textSecondary: '#6E8CA0',
    textTertiary: '#FFFFFF',

    formInputBG: '#F7F8FB',
    formInputBorder: '#E4E6ED',
    
    // Misc
    borders: '#F8F4F9',
    grey: '#e8e8e8',
    black: '#050401',
    appBG: '#eceff0',

    // primary colours
    sage: '#87BCBF',
    rust: '#D97D54',
    drab: '#324755',

    // secondary colours
    ice: '#F0F3F4',
    fossil: '#C8D1D3',
    sand: '#B9B0A2',
  } as ColorScheme,
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    error: '#ff4b4b',
  } as ColorScheme,
};

export type { ColorScheme };
export default Colors;
