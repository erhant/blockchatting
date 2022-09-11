import { NextPage } from "next"
import { useWalletContext } from "../context/wallet.context"
import { Chat__factory, Chat as ChatContract } from "../types/typechain/"
import { useEffect, useState } from "react"
import Layout from "../components/layout"
import { Button, Text, Group, Title, Box, Divider } from "@mantine/core"
import { notify, notifyError, notifyTransaction, notifyTransactionUpdate } from "../utils/notify"
import { ArrowUpCircle, ArrowDownCircle, Refresh } from "tabler-icons-react"
import { truncateAddress } from "../utils/utility"
import { useChatContext } from "../context/chat.context"
import NoWallet from "../components/no-wallet"
import { CryptoECIES, CryptoMetaMask, CryptoAES256, generateSecret } from "../lib/crypto"
import { parseEther } from "ethers/lib/utils"

const CounterContractPage: NextPage = () => {
  const { wallet } = useWalletContext()
  const { contract } = useChatContext()
  const [messages, setMessages] = useState([])
  const [cryptoMetaMask, setCryptoMetaMask] = useState<CryptoMetaMask>()
  const [cryptoECIES, setCryptoECIES] = useState<CryptoECIES>()
  const [cryptoAES256, setCryptoAES256] = useState<CryptoAES256>()
  const [peerAddress, setPeerAddress] = useState<string>()

  const myAddress = wallet?.address || ""

  useEffect(() => {
    setCryptoMetaMask(new CryptoMetaMask(myAddress, window.ethereum))
  }, [wallet])
  // on contract load, get the messages and subscribe to events
  useEffect(() => {
    if (!contract || !cryptoMetaMask) return

    // everyone sees contract owner as the first peerAddress
    contract.owner().then((o) => setPeerAddress(o))

    // get initialization
    contract.isUserInitialized(myAddress).then((isUserInitialized) => {
      if (isUserInitialized) {
        // retrieve and decrypt your secret
        contract.userInitializations(myAddress).then((userInitialization) => {
          const encryptedUserSecret = Buffer.from(userInitialization[0].slice(2), "hex")
          cryptoMetaMask.decrypt(encryptedUserSecret).then((userSecret) => setCryptoECIES(new CryptoECIES(userSecret)))
        })
      } else {
        // encrypt and store your secret

        const entryFee = parseEther("0.1") // TODO: retrieve this from contract
        const userSecret = generateSecret()
        const publicKey = Buffer.from(new CryptoECIES(userSecret).getPublicKey(), "hex")
        cryptoMetaMask.encrypt(userSecret).then((encryptedUserSecret) => {
          console.log(userSecret, encryptedUserSecret)
          contract
            .initializeUser(
              encryptedUserSecret.toJSON().data, // this is supposed to be encrypted by MetaMask, but we dont do it in the test
              publicKey[0] == 2, // prefix
              publicKey.slice(1).toJSON().data, // 32 bytes
              {
                value: entryFee,
              }
            )
            // TODO: call this from an event, instead of this promise
            .then(() => setCryptoECIES(new CryptoECIES(userSecret)))
        })
      }
    })

    // TODO: get history of chat initializations to display them as a history of chatted users

    return () => {
      // unsubscribe from events
      contract.removeAllListeners()
      setPeerAddress(undefined)
    }
  }, [contract, cryptoMetaMask])

  useEffect(() => {
    if (!peerAddress || !contract || !cryptoECIES) return

    // get peerAddress key
    contract.isChatInitialized(myAddress, peerAddress).then((isChatInitialized) => {
      if (isChatInitialized) {
        // get chat secret
        contract.chatInitializations(myAddress, peerAddress).then((chatSecretEncrypted) => {
          const encryptedChatSecret = Buffer.from(chatSecretEncrypted.slice(2), "hex")
          const chatSecret = cryptoECIES.decrypt(encryptedChatSecret)
          setCryptoAES256(new CryptoAES256(chatSecret))
        })
      } else {
        const chatSecret = generateSecret()
        // encrypt with both keys

        contract.userInitializations(peerAddress).then((userInitialization) => {
          // encrypt for peerAddress
          const peerPublicKey = Buffer.from(
            (userInitialization[1] ? "02" : "03") + userInitialization[2].slice(2),
            "hex"
          )
          const chatSecretEncryptedForPeer = CryptoECIES.encrypt(peerPublicKey.toString("hex"), chatSecret)
          // encrypt for yourself
          const chatSecretEncryptedForMe = cryptoECIES.encrypt(chatSecret)

          // initialize chat and update state
          contract.initializeChat(chatSecretEncryptedForMe, chatSecretEncryptedForPeer, peerAddress).then(() => {
            // TODO: call this from an event, instead of this promise
            setCryptoAES256(new CryptoAES256(chatSecret))
          })
        })
      }
    })
  }, [peerAddress, contract])

  useEffect(() => {
    if (!peerAddress || !contract || !cryptoAES256) return

    // get messages
    Promise.all([
      contract.queryFilter(contract.filters.MessageSent(myAddress, peerAddress)),
      contract.queryFilter(contract.filters.MessageSent(peerAddress, myAddress)),
    ]).then(([msgFromMe, msgToMe]) => {
      // sort messages by block number
      const msgs = msgFromMe
        .concat(msgToMe)
        // TODO: is this right?
        .sort((a, b) => (a.args._time.lt(b.args._time) ? 1 : -1))
        .map((msgEvent) => ({
          from: msgEvent.args._from,
          to: msgEvent.args._from,
          message: cryptoAES256.decrypt(Buffer.from(msgEvent.args._message)), // TODO decrypt here
          time: msgEvent.args._time.toNumber(),
        }))
      // decrypt messages
    })

    return () => {
      setCryptoAES256(undefined)
    }
  }, [peerAddress, cryptoAES256])

  if (!contract) {
    return <NoWallet />
  } else {
    return (
      <Layout>
        <Divider />

        <Text>Your address: {myAddress}</Text>
        <Text>Peer address: {peerAddress}</Text>
        <Text>Is Chat Initialized: {cryptoAES256 !== undefined ? "Yes" : "No"}</Text>
        <Text>Is User Initialized: {cryptoECIES !== undefined ? "Yes" : "No"}</Text>
        <Divider />
        {messages.map((m) => JSON.stringify(m))}
      </Layout>
    )
  }
}

export default CounterContractPage
