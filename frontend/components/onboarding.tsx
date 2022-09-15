import {Box, Container, Text, Group, Stepper, Button} from '@mantine/core';
import {FC, useState} from 'react';
import {useChatContext} from '../context/chat.context';
import {Chat} from '../types/typechain';
import {CryptoECIES, CryptoMetaMask, generateSecret} from '../lib/crypto';
import {WalletType} from '../types/wallet';
import Dashboard from './dashboard';
import {notifyError, notifyTransaction, notifyTransactionUpdate} from '../utils/notify';

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
      const userInitialization = await contract.userInitializations(wallet.address);

      // retrieve secret
      const encryptedUserSecret = Buffer.from(userInitialization.encryptedUserSecret.slice(2), 'hex');

      // decrypt with your metamask
      setIsLoading(true);
      try {
        const userSecret = await new CryptoMetaMask(wallet.address, window.ethereum).decrypt(encryptedUserSecret);
        setUserScheme(new CryptoECIES(userSecret));
        setActiveStep(OnboardStatus.FETCHING);
      } catch (e) {
        notifyError(e, 'Could not decrypt.');
      }
    }

    setIsLoading(false);
  }

  async function initializeUser(contract: Chat) {
    // encrypt and store your secret
    const userSecret = generateSecret();
    const publicKey = Buffer.from(new CryptoECIES(userSecret).getPublicKey(), 'hex');

    setIsLoading(true);
    try {
      const encryptedUserSecret = await new CryptoMetaMask(wallet.address, window.ethereum).encrypt(userSecret);
      try {
        const tx = await contract.initializeUser(
          encryptedUserSecret.toJSON().data,
          publicKey[0] == 2, // public key prefix
          publicKey.slice(1).toJSON().data,
          {
            value: await contract.entryFee(), // entry fee retrieved from contract
          }
        );
        const txID = notifyTransaction(tx);
        await tx.wait();
        notifyTransactionUpdate(txID, 'User initialized!');
        setUserScheme(new CryptoECIES(userSecret));
        setActiveStep(OnboardStatus.FETCHING);
      } catch (e) {
        notifyError(e, 'Could not initialize user.');
      }
    } catch (e) {
      notifyError(e, 'Could not encrypt.');
    }

    setIsLoading(false);
  }

  async function loadChatHistory(contract: Chat) {
    const [chatFromMe, chatFromThem] = await Promise.all([
      contract.queryFilter(contract.filters.ChatInitialized(wallet.address, null)),
      contract.queryFilter(contract.filters.ChatInitialized(null, wallet.address)),
    ]);
    setPreviousPeers(chatFromMe.map(h => h.args.peer).concat(chatFromThem.map(h => h.args.initializer)));
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
