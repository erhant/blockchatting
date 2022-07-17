import { NetworkInfoType } from "../types/networks"

const unknownIconURL = "/assets/questionmark.svg"
export const unknownNetwork: NetworkInfoType = {
  chainName: "unknown",
  nativeCurrency: { name: "", decimals: 18, symbol: "" },
  iconURL: unknownIconURL,
}

const _networks: {
  [chainId: number]: NetworkInfoType
} = {
  // Development (localhost)
  31337: {
    chainName: "localhost",
    nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
    iconURL: "/assets/code.svg",
  },
  // Ethereum
  1: {
    chainName: "Ethereum Mainnet",
    nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
    iconURL: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
  },
  3: {
    chainName: "Ropsten Testnet",
    nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
    iconURL: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
  },
  4: {
    chainName: "Rinkeby Testnet",
    nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
    iconURL: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
  },
  5: {
    chainName: "Goerli Testnet",
    nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
    iconURL: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
  },
  42: {
    chainName: "Kovan Testnet",
    nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
    iconURL: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
  },
  // Binance Smart Chain
  56: {
    chainName: "Binance Smart Chain Mainnet",
    nativeCurrency: { name: "BNB", decimals: 18, symbol: "BNB" },
    iconURL: "https://cryptologos.cc/logos/bnb-bnb-logo.svg",
  },
  // Avalanche
  43114: {
    chainName: "Avalanche C-Chain",
    nativeCurrency: { name: "AVAX", decimals: 18, symbol: "AVAX" },
    iconURL: "https://cryptologos.cc/logos/avalanche-avax-logo.svg",
  },
  43113: {
    chainName: "Avalanche FUJI C-Chain",
    nativeCurrency: { name: "AVAX", decimals: 18, symbol: "AVAX" },
    iconURL: "https://cryptologos.cc/logos/avalanche-avax-logo.svg",
  },
  // Fantom Opera
  250: {
    chainName: "Fantom Opera",
    nativeCurrency: { name: "FTM", decimals: 18, symbol: "FTM" },
    iconURL: "https://cryptologos.cc/logos/fantom-ftm-logo.svg",
  },
  // Polygon
  137: {
    chainName: "Polygon Mainnet",
    nativeCurrency: { name: "MATIC", decimals: 18, symbol: "MATIC" },
    iconURL: "https://cryptologos.cc/logos/polygon-matic-logo.svg",
  },
  80001: {
    chainName: "Mumbai Testnet",
    nativeCurrency: { name: "MATIC", decimals: 18, symbol: "MATIC" },
    iconURL: "https://cryptologos.cc/logos/polygon-matic-logo.svg",
  },
  // Moonriver
  1285: {
    chainName: "Moonriver",
    nativeCurrency: { name: "MOVR", decimals: 18, symbol: "MOVR" },
    iconURL: unknownIconURL,
  },
  // Moonbeam
  1284: {
    chainName: "Moonbeam",
    nativeCurrency: { name: "GLMR", decimals: 18, symbol: "GLMR" },
    iconURL: unknownIconURL,
  },
  // Aurora
  1313161554: {
    chainName: "Aurora",
    nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
    iconURL: unknownIconURL,
  },
  1313161555: {
    chainName: "Aurora Testnet",
    nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
    iconURL: unknownIconURL,
  },
}

/**
 * @param {number} chainId chainID of a given network
 * @returns {NetworkInfoType} details of the network, such as name and native currency
 */
function getNetwork(chainId: number): NetworkInfoType {
  if (chainId in _networks) {
    return _networks[chainId]
  } else {
    return unknownNetwork
  }
}
export default getNetwork
