import { AppProps } from "next/app"
import { useState } from "react"
import Head from "next/head"
// global styles
import "../styles/globals.scss"
// mantine theming
import yourMantineTheme from "../themes/mantine"
import { MantineProvider, ColorScheme, ColorSchemeProvider } from "@mantine/core"
import { WalletContextWrapper } from "../context/wallet.context"
import { NotificationsProvider } from "@mantine/notifications"
import { ChatContextWrapper } from "../context/chat.context"

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props
  const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme)

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === "dark" ? "light" : "dark")
    setColorScheme(nextColorScheme)
    // NOTE: if you want to, set cookie here
  }

  return (
    <>
      <Head>
        <title>NextJS + Web3 Starter</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <meta name="description" content="A NextJS + Web3 starter template, supporting Hardhat with TypeScript." />
      </Head>

      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
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
  )
}
