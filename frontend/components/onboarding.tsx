import {Box, Container, Text, Group, Stepper, Button} from '@mantine/core';
import {FC, useState} from 'react';
import {useChatContext} from '../context/chat.context';
import {Chat} from '../types/typechain';
import {CryptoECIES, CryptoMetaMask, generateSecret} from '../lib/crypto';
import {WalletType} from '../types/wallet';
import Dashboard from './dashboard';

enum OnboardStatus {
  CHECKING = 0,
  INITIALIZING = 1,
  FETCHING = 2,
}

// Onboarding is responsible of taking the user in, initializing them and showing the progress
const Onboarding: FC<{wallet: WalletType}> = ({wallet}) => {
  const {contract} = useChatContext();
  const [isUserInitialized, setIsUserInitialized] = useState<boolean>();
  const [userScheme, setUserScheme] = useState<CryptoECIES>();
  const [activeStep, setActiveStep] = useState<OnboardStatus>(OnboardStatus.CHECKING);
  const [isLoading, setIsLoading] = useState(false);
  const [previousPeers, setPreviousPeers] = useState<string[]>();

  async function checkUserInitialization(contract: Chat) {
    setIsLoading(true);
    const isUserInitialized = await contract.isUserInitialized(wallet.address);
    setIsUserInitialized(isUserInitialized);
    setActiveStep(OnboardStatus.INITIALIZING);

    if (isUserInitialized) {
      console.log('User already initialized');
      const userInitialization = await contract.userInitializations(wallet.address);

      // retrieve secret
      const encryptedUserSecret = Buffer.from(userInitialization.encryptedUserSecret.slice(2), 'hex');

      // decrypt with your metamask
      setIsLoading(true);
      const cryptoMetaMask = new CryptoMetaMask(wallet.address, window.ethereum);
      const userSecret = await cryptoMetaMask.decrypt(encryptedUserSecret);
      setUserScheme(new CryptoECIES(userSecret));
      setActiveStep(OnboardStatus.FETCHING);
    } else console.log('User not initialized');

    setIsLoading(false);
  }

  async function initializeUser(contract: Chat) {
    const cryptoMetaMask = new CryptoMetaMask(wallet.address, window.ethereum);
    // encrypt and store your secret
    const userSecret = generateSecret();
    const publicKey = Buffer.from(new CryptoECIES(userSecret).getPublicKey(), 'hex');

    setIsLoading(true);
    const encryptedUserSecret = await cryptoMetaMask.encrypt(userSecret);
    console.log(userSecret, encryptedUserSecret);
    await contract.initializeUser(
      encryptedUserSecret.toJSON().data, // this is supposed to be encrypted by MetaMask, but we dont do it in the test
      publicKey[0] == 2, // prefix
      publicKey.slice(1).toJSON().data, // 32 bytes
      {
        value: await contract.entryFee(), // entry fee retrieved from contract
      }
    );
    setUserScheme(new CryptoECIES(userSecret));
    setActiveStep(OnboardStatus.FETCHING);
    setIsLoading(false);
  }

  async function loadChatHistory(contract: Chat) {
    const history1 = await contract.queryFilter(contract.filters.ChatInitialized(wallet.address, null));
    const history2 = await contract.queryFilter(contract.filters.ChatInitialized(null, wallet.address));
    console.log('HISTORY:', history1.concat(...history2));
    setPreviousPeers(history1.concat(...history2).map(h => h.args[0]));
  }

  return !(previousPeers && userScheme) ? (
    <Stepper active={activeStep} orientation="vertical">
      {/* check if user is initialized */}
      <Stepper.Step
        label="Checking User"
        description="todo"
        loading={activeStep == OnboardStatus.CHECKING && isLoading}
      >
        <Button onClick={() => checkUserInitialization(contract!)}>Check</Button>
      </Stepper.Step>

      {/* initailize user */}
      <Stepper.Step
        label="Initializing"
        description="todo"
        loading={activeStep == OnboardStatus.INITIALIZING && isLoading}
      >
        {isUserInitialized ? (
          <Text>Decrypting your encrypted key...</Text>
        ) : (
          <Button onClick={() => initializeUser(contract!)}>Initialize</Button>
        )}
      </Stepper.Step>

      {/* load chat history for the user */}
      <Stepper.Step
        label="Loading Chat History"
        description="Create an account"
        loading={activeStep == OnboardStatus.FETCHING && isLoading}
      >
        <Button onClick={() => loadChatHistory(contract!)}>Load</Button>
      </Stepper.Step>
    </Stepper>
  ) : (
    <Dashboard myAddress={wallet.address} contract={contract!} userScheme={userScheme} previousPeers={previousPeers} />
  );
};

export default Onboarding;
