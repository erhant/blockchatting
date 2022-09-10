import { NextPage } from "next"
import { useWalletContext } from "../context/wallet.context"
import { useCallback, useEffect, useMemo, useState } from "react"
import Layout from "../components/layout"
import { Button, Text, Group, Title, Box, TextInput, NumberInput } from "@mantine/core"
import { CryptoMetaMask } from "../api/public-key-crypto"

const MyTokenContractPage: NextPage = () => {
  const { wallet } = useWalletContext()
  const [isDisabled, setIsDisabled] = useState(false)

  async function handleClick() {
    if (wallet == undefined) return
    const msg = "abcdef123456"

    // Public Key
    const CryptoMetaMask = new CryptoMetaMask(wallet.address, window.ethereum)
    const ciphertext = await CryptoMetaMask.encrypt(Buffer.from(msg, "utf-8"))
    const plaintext = await CryptoMetaMask.decrypt(ciphertext)

    console.log("MSG:", msg)
    console.log("C:", ciphertext.toString("utf-8"))
    console.log("P:", plaintext.toString("utf-8"))
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
