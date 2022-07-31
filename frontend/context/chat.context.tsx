import { useWalletContext } from "../context/wallet.context"
import { Chat__factory, Chat as ChatContract } from "../types/typechain/"
import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react"
import { notify, notifyError } from "../utils/notify"
import getContractAddress from "../constants/contractAddresses"
import contractConstants from "../constants/contractConstants"
import { truncateAddress } from "../utils/utility"

const ChatContext = createContext<{ contract: ChatContract | undefined }>({ contract: undefined })

export const ChatContextWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  const { wallet } = useWalletContext()
  const [contract, setContract] = useState<ChatContract>()

  useEffect(() => {
    if (wallet) {
      try {
        const contractAddress = getContractAddress(contractConstants.Chat.contractName, wallet.chainId)
        notify("Contract Connected", "Connected to " + truncateAddress(contractAddress), "success")
        setContract(Chat__factory.connect(contractAddress, wallet.library.getSigner(wallet.address)))
      } catch (e: any) {
        notifyError(e, "Contract Not Found", false)
      }
    }

    return () => {
      setContract(undefined)
    }
  }, [wallet])

  return <ChatContext.Provider value={{ contract }}>{children}</ChatContext.Provider>
}

// custom hook
export function useChatContext() {
  return useContext(ChatContext)
}
