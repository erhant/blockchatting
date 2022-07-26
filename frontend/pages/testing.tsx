import { NextPage } from "next"
import { useWalletContext } from "../context/wallet.context"
import { MyToken__factory, MyToken as MyTokenContract } from "../types/typechain"
import { useCallback, useEffect, useMemo, useState } from "react"
import Layout from "../components/layout"
import { Button, Text, Group, Title, Box, TextInput, NumberInput } from "@mantine/core"
import { notify, notifyError, notifyTransaction, notifyTransactionUpdate } from "../utils/notify"
import { BigNumber, ethers, EventFilter } from "ethers"
import getContractAddress from "../constants/contractAddresses"
import contractConstants from "../constants/contractConstants"
import { formatUnits, keccak256, parseUnits, toUtf8Bytes } from "ethers/lib/utils"
import { truncateAddress } from "../utils/utility"

const MyTokenContractPage: NextPage = () => {
  const { wallet } = useWalletContext()
  const [isDisabled, setIsDisabled] = useState(false)

  async function handleClick() {
    if (wallet == undefined) return

    // Public Key
    const keyB64: string = (await window.ethereum.request({
      method: "eth_getEncryptionPublicKey",
      params: [wallet.address],
    })) as string
    const publicKey = Buffer.from(keyB64, "base64")
    console.log("Public Key:", publicKey)
    console.log("Hash:", keccak256(publicKey))
    console.log("Address:", wallet.address)

    // Encryption
    const msg = "abcdef123456"
    window.ethereum.request()
  }

  return (
    <Layout>
      {wallet ? (
        <Button
          disabled={isDisabled}
          onClick={() => {
            setIsDisabled(true)
            handleClick().then(() => setIsDisabled(false))
          }}
        >
          Click me
        </Button>
      ) : (
        <Title p="xl">Please connect your wallet first.</Title>
      )}
    </Layout>
  )
}

export default MyTokenContractPage
