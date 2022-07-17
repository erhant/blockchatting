import { createContext, useContext, useState, useEffect } from "react"
import type { FC, ReactNode } from "react"
import Web3Modal from "web3modal"
import { ethers } from "ethers"
import { hexToDecimal, truncateAddress } from "../utils/utility"
import { notify } from "../utils/notify"
import type { WalletContextType, WalletType } from "../types/wallet"

const WalletContext = createContext<WalletContextType>({
  connectWallet: async () => {},
  disconnectWallet: () => {},
  wallet: undefined,
})

export const WalletContextWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>()
  const [wallet, setWallet] = useState<WalletType>()

  useEffect(() => {
    // optional: give providers
    setWeb3Modal(new Web3Modal())

    return () => {
      setWeb3Modal(undefined)
    }
  }, [])

  // retrieves the provider from Web3Modal, and then sets the context wallet
  const connectWallet = async () => {
    try {
      const provider = await web3Modal!.connect()
      const library = new ethers.providers.Web3Provider(
        provider,
        "any" // important for switching networks! https://github.com/NoahZinsmeister/web3-react/issues/127
      )
      const accounts = await library.listAccounts()
      const network = await library.getNetwork()
      if (accounts) {
        setWallet({
          provider,
          library,
          network,
          address: accounts[0], // always get the first account (topmost),
          chainId: network.chainId,
        })
      } else {
        notify("Error", "Could not find any accounts!", "error")
      }
    } catch (error) {
      notify("Error", "Could not connect wallet properly!", "error")
      console.log(error)
    }
  }

  // sets the wallet context to be undefined.
  const disconnectWallet = () => {
    try {
      web3Modal?.clearCachedProvider()
      setWallet(undefined)
    } catch (error) {
      notify("Error", "Could not disconnect wallet properly!", "error")
    }
  }

  useEffect(() => {
    if (!(wallet && wallet.provider.on)) return

    // account changed
    const handleAccountsChanged = (accounts: string[]) => {
      if (!(accounts && accounts.length > 0)) return
      setWallet({ ...wallet, address: accounts[0] })
      notify("Account Change", `${truncateAddress(wallet.address)} changed to ${truncateAddress(accounts[0])}.`, "info")
    }

    // network chain changed
    const handleChainChanged = (chainId: number) => {
      const newChainId = hexToDecimal(chainId)
      setWallet({ ...wallet, chainId: newChainId })
      notify("Network Change", "You have changed to chain " + newChainId, "success")
      // @note: you can add a "supported-chain check" here if you want
    }

    // wallet is disconnected from the injected provider
    const handleDisconnect = () => {
      setWallet(undefined)
      notify("Wallet Disconnect", "You have disconnected your wallet.", "success")
    }

    wallet.provider.on("accountsChanged", handleAccountsChanged)
    wallet.provider.on("chainChanged", handleChainChanged)
    wallet.provider.on("disconnect", handleDisconnect)

    return () => {
      wallet.provider.removeListener("accountsChanged", handleAccountsChanged)
      wallet.provider.removeListener("chainChanged", handleChainChanged)
      wallet.provider.removeListener("disconnect", handleDisconnect)
    }
  }, [wallet])

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// custom hook
export function useWalletContext() {
  return useContext(WalletContext)
}
