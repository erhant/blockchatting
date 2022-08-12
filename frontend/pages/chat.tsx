import { NextPage } from "next"
import { useWalletContext } from "../context/wallet.context"
import { Chat__factory, Chat as ChatContract } from "../types/typechain/"
import { useEffect, useState } from "react"
import Layout from "../components/layout"
import { Button, Text, Group, Title, Box } from "@mantine/core"
import { notify, notifyError, notifyTransaction, notifyTransactionUpdate } from "../utils/notify"
import { ArrowUpCircle, ArrowDownCircle, Refresh } from "tabler-icons-react"
import { truncateAddress } from "../utils/utility"
import { useChatContext } from "../context/chat.context"
import NoWallet from "../components/no-wallet"

const CounterContractPage: NextPage = () => {
  const { wallet } = useWalletContext()
  const { contract } = useChatContext()
  const [messages, setMessages] = useState([])

  const me = wallet?.address || ""
  const [peer, setPeer] = useState<string>()

  // on contract load, get the messages and subscribe to events
  useEffect(() => {
    if (!contract) return

    // everyone sees contract owner as the first peer
    contract.owner().then((o) => setPeer(o))

    // TODO: get aliases of friends in your friendlist
    return () => {
      // unsubscribe from events
      contract.removeAllListeners()
      setPeer(undefined)
    }
  }, [contract])

  useEffect(() => {
    if (!peer || !contract) return

    // get decryption key

    // get messages
    Promise.all([
      contract.queryFilter(contract.filters.MessageSent(me, peer)),
      contract.queryFilter(contract.filters.MessageSent(peer, me)),
    ]).then(([msgFromMe, msgToMe]) => {
      // sort messages by block number
      const msgs = msgFromMe
        .concat(msgToMe)
        .sort((a, b) => a.blockNumber - b.blockNumber)
        .map((msgEvent) => ({
          from: msgEvent.args._from,
          to: msgEvent.args._from,
          message: msgEvent.args._message, // TODO decrypt here
        }))
      // decrypt messages
    })

    // subscribe to events
  }, [peer, contract])

  if (!contract) {
    return <NoWallet />
  } else {
    return (
      <Layout>
        <Text>Your address: ${wallet?.address}</Text>
        <Text>Peer address: ${peer}</Text>
        <hr />
        {messages.map((m) => JSON.stringify(m))}
      </Layout>
    )
  }
}

export default CounterContractPage
