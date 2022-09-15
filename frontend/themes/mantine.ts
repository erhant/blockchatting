import type {MantineThemeOverride} from '@mantine/core';

// Mantine uses OpenColor color scheme by default. All colors must be a 10-tuple
// see: https://yeun.github.io/open-color
type ThemeColor = [string, string, string, string, string, string, string, string, string, string];

// your primary color
const primary: ThemeColor = [
  '#F3F0FF',
  '#E5DBFF',
  '#D0BFFF',
  '#B197FC',
  '#9775FA',
  '#845EF7',
  '#7950F2',
  '#7048E8',
  '#6741D9',
  '#5F3DC4',
];
// your secondary color
const secondary: ThemeColor = [
  '#FFF4E6',
  '#FFE8CC',
  '#FFD8A8',
  '#FFC078',
  '#FFA94D',
  '#FF922B',
  '#FD7E14',
  '#F76707',
  '#E8590C',
  '#D9480F',
];

// your font families
const fontFamilies = {
  body: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Cantarell, sans-serif',
  header: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Cantarell, sans-serif',
  monospace: 'Courier New, Courier, monospace',
};

const yourMantineTheme: MantineThemeOverride = {
  colors: {
    primary,
    secondary,
  },
  fontFamily: fontFamilies.body,
  fontFamilyMonospace: fontFamilies.monospace,
  headings: {
    fontFamily: fontFamilies.header,
  },
  primaryColor: 'primary',
  colorScheme: 'dark',
};

export default yourMantineTheme;
