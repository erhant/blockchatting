import type {MantineThemeOverride} from '@mantine/core';

// your font families
const fontFamilies = {
  body: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Cantarell, sans-serif',
  header: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Cantarell, sans-serif',
  monospace: 'Courier New, Courier, monospace',
};

const yourMantineTheme: MantineThemeOverride = {
  fontFamily: fontFamilies.body,
  fontFamilyMonospace: fontFamilies.monospace,
  headings: {
    fontFamily: fontFamilies.header,
  },
  primaryColor: 'teal',
  colorScheme: 'dark',
};

export default yourMantineTheme;
