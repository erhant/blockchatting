import {AppProps} from 'next/app';
import {useState} from 'react';
import Head from 'next/head';
// global styles
import '../styles/globals.scss';
// mantine theming
import yourMantineTheme from '../themes/mantine';
import {MantineProvider, ColorScheme, ColorSchemeProvider} from '@mantine/core';
import {WalletContextWrapper} from '../context/wallet.context';
import {NotificationsProvider} from '@mantine/notifications';
import {ChatContextWrapper} from '../context/chat.context';

export default function App(props: AppProps & {colorScheme: ColorScheme}) {
  const {Component, pageProps} = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme);

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
    setColorScheme(nextColorScheme);
    // NOTE: if you want to, set cookie here
  };

  return (
    <>
      <Head>
        <title>Blockchattin</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <meta name="description" content="A decentralized peer-to-peer chatting application." />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#00aba9" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          withCSSVariables
          theme={{
            ...yourMantineTheme,
            colorScheme,
            // you can change primaryColor w.r.t colorScheme here
          }}
        >
          <WalletContextWrapper>
            <ChatContextWrapper>
              <NotificationsProvider>
                <Component {...pageProps} />
              </NotificationsProvider>
            </ChatContextWrapper>
          </WalletContextWrapper>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}
