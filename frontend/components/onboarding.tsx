import {Box, Container, Text, Group, Stepper, Button} from '@mantine/core';
import {FC, useEffect, useState} from 'react';
import {useChatContext} from '../context/chat.context';
import {Chat} from '../types/typechain';
import {CryptoECIES, CryptoMetaMask, generateSecret} from '../lib/crypto';
import {WalletType} from '../types/wallet';
import Dashboard from './dashboard';
import {notifyError, notifyTransaction, notifyTransactionUpdate} from '../utils/notify';
import ReactNiceAvatar from 'react-nice-avatar';
import {addressToAvatarConfig, addressToUsername} from '../lib/profile';
import {BigNumber} from 'ethers';
import {formatEther} from 'ethers/lib/utils';

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
  const [entryFee, setEntryFee] = useState<BigNumber>();

  useEffect(() => {
    setUserScheme(undefined);
    setActiveStep(OnboardStatus.CHECKING);
    setIsUserInitialized(undefined);
    setPreviousPeers(undefined);
  }, [wallet]);
  useEffect(() => {
    async function checkUserInitialization(contract: Chat) {
      await new Promise(resolve => {
        setTimeout(resolve, 1000);
      });
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

    if (!contract) return;

    setIsLoading(true);
    contract.entryFee().then(e => {
      setEntryFee(e);
      checkUserInitialization(contract);
    });
  }, [contract]);

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
      } catch (e) {
        return notifyError(e, 'Could not initialize user.');
      }
    } catch (e) {
      return notifyError(e, 'Could not encrypt.');
    }

    setIsLoading(false);
    setUserScheme(new CryptoECIES(userSecret));
    setActiveStep(OnboardStatus.FETCHING);
  }

  useEffect(() => {
    async function loadChatHistory(contract: Chat) {
      await new Promise(resolve => {
        setTimeout(resolve, 1000);
      });
      const [chatFromMe, chatFromThem] = await Promise.all([
        contract.queryFilter(contract.filters.ChatInitialized(wallet.address, null)),
        contract.queryFilter(contract.filters.ChatInitialized(null, wallet.address)),
      ]);
      setPreviousPeers(chatFromMe.map(h => h.args.peer).concat(chatFromThem.map(h => h.args.initializer)));
    }

    if (contract && activeStep == OnboardStatus.FETCHING) loadChatHistory(contract);
  }, [activeStep, contract]);

  return !(previousPeers && userScheme) ? (
    <Stepper active={activeStep} orientation="vertical">
      {/* check if user is initialized */}
      <Stepper.Step
        label="Checking Initialization"
        description={
          isUserInitialized == undefined
            ? 'We are checking if you have used this app before...'
            : isUserInitialized
            ? 'Welcome back, ' + addressToUsername(wallet.address) + '.'
            : 'You are a first time user!'
        }
        loading={activeStep == OnboardStatus.CHECKING && isLoading}
      ></Stepper.Step>

      {/* initailize user */}
      <Stepper.Step
        label="Initializing"
        description={
          activeStep == OnboardStatus.FETCHING
            ? 'Initialized.'
            : isUserInitialized == undefined
            ? ''
            : isUserInitialized
            ? 'Waiting for key decryption...'
            : 'Click initialize to create a key-pair!'
        }
        loading={activeStep == OnboardStatus.INITIALIZING && isLoading}
      >
        {isUserInitialized == false && (
          <Button onClick={() => initializeUser(contract!)}>{`Initialize (${formatEther(entryFee!)} ETH)`}</Button>
        )}
      </Stepper.Step>

      {/* load chat history for the user */}
      <Stepper.Step
        label="Loading Chat History"
        description="Create an account"
        loading={activeStep == OnboardStatus.FETCHING && isLoading}
      ></Stepper.Step>
    </Stepper>
  ) : (
    <Dashboard myAddress={wallet.address} contract={contract!} userScheme={userScheme} previousPeers={previousPeers} />
  );
};

export default Onboarding;
