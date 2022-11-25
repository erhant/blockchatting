import {AppProps} from 'next/app';
import {useState} from 'react';
import Head from 'next/head';
import '../styles/globals.scss';
import yourMantineTheme from '../themes/mantine';
import {MantineProvider, ColorScheme, ColorSchemeProvider} from '@mantine/core';
import {NotificationsProvider} from '@mantine/notifications';
import {ChatContextWrapper} from '../context/chat.context';
import ThemeToggleButton from '../components/theme-toggle-button';
import {WagmiConfig, createClient, defaultChains, configureChains} from 'wagmi';
import {publicProvider} from 'wagmi/providers/public';
import {MetaMaskConnector} from 'wagmi/connectors/metaMask';

// create Wagmi client
const myChains = [
  // local hardhat
  {
    id: 31337,
    name: 'Hardhat Local',
    network: 'hardhat',
    nativeCurrency: {
      decimals: 18,
      name: 'Ethereum',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: 'http://localhost:8545',
    },
    blockExplorers: {
      default: {name: '', url: ''},
    },
    testnet: true,
  },
  ...defaultChains,
];
const {chains, provider, webSocketProvider} = configureChains(myChains, [publicProvider()]);
const client = createClient({
  // autoConnect: true,
  connectors: [new MetaMaskConnector({chains})],
  provider,
  webSocketProvider,
});

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
        <title>Blockchatting</title>
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
          <WagmiConfig client={client}>
            <ChatContextWrapper>
              <NotificationsProvider>
                <ThemeToggleButton />
                <Component {...pageProps} />
              </NotificationsProvider>
            </ChatContextWrapper>
          </WagmiConfig>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}
