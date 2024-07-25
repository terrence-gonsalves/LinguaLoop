/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#D97D54';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#FFFFFF',
    background: '#fff',
    tint: tintColorLight,
    icon: '#324755',
    tabIconDefault: '#324755',
    tabIconSelected: tintColorLight,
    error: '#ff4b4b',
    outLineBtnText: '#C8D1D3',
    link: '#1cb0f6',
    generalBG: '#F7F8FB',
    tabsBG: '#6E8CA0',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
