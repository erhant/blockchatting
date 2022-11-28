import {Stepper, Button} from '@mantine/core';
import {FC, useEffect, useState} from 'react';
import {useChatContext} from '../context/chat.context';
import {Chat} from '../types/typechain';
import {CryptoECIES, CryptoMetaMask, generateSecret} from '../lib/crypto';
import Dashboard from './dashboard';
import {notifyError, notifyTransactionWithWait} from '../utils/notify';
import {addressToUsername} from '../lib/profile';
import {BigNumber} from 'ethers';
import {formatEther} from 'ethers/lib/utils';
import Layout from './layout';

enum OnboardStatus {
  CHECKING = 0,
  INITIALIZING = 1,
  FETCHING = 2,
}

// Onboarding is responsible of taking the user in, initializing them and showing the progress
const Onboarding: FC<{address: string}> = ({address}) => {
  const {contract} = useChatContext();
  const [isUserInitialized, setIsUserInitialized] = useState<boolean>();
  const [userScheme, setUserScheme] = useState<CryptoECIES>();
  const [activeStep, setActiveStep] = useState<OnboardStatus>(OnboardStatus.CHECKING);
  const [isLoading, setIsLoading] = useState(true);
  const [previousPeers, setPreviousPeers] = useState<string[]>();
  const [entryFee, setEntryFee] = useState<BigNumber>();

  useEffect(() => {
    setUserScheme(undefined);
    setActiveStep(OnboardStatus.CHECKING);
    setIsUserInitialized(undefined);
    setPreviousPeers(undefined);
  }, [address]);

  useEffect(() => {
    async function checkUserInitialization(contract: Chat) {
      await new Promise(resolve => {
        setTimeout(resolve, 1000);
      });
      const isUserInitialized = await contract.isUserInitialized(address);
      setIsUserInitialized(isUserInitialized);
      setActiveStep(OnboardStatus.INITIALIZING);

      if (isUserInitialized) {
        const userInitialization = await contract.userInitializations(address);

        // retrieve secret
        const encryptedUserSecret = Buffer.from(userInitialization.encryptedUserSecret.slice(2), 'hex');

        // decrypt with your metamask
        setIsLoading(true);
        try {
          // TODO: give provider here
          const userSecret = await new CryptoMetaMask(address, window.ethereum).decrypt(encryptedUserSecret);
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
  }, [contract, address]);

  async function initializeUser(contract: Chat) {
    // encrypt and store your secret
    const userSecret = generateSecret();
    const publicKey = Buffer.from(new CryptoECIES(userSecret).getPublicKey(), 'hex');

    setIsLoading(true);
    try {
      // @ts-ignore
      // todo: use connector
      const encryptedUserSecret = await new CryptoMetaMask(address, window.ethereum).encrypt(userSecret);
      try {
        const tx = await contract.initializeUser(
          encryptedUserSecret.toJSON().data,
          publicKey[0] == 2, // public key prefix
          publicKey.slice(1).toJSON().data,
          {
            value: await contract.entryFee(), // entry fee retrieved from contract
          }
        );
        await notifyTransactionWithWait(tx, 'User initialized!');
      } catch (e) {
        notifyError(e, 'Could not initialize user.');
        return;
      }
    } catch (e) {
      notifyError(e, 'Could not encrypt.');
      return;
    }

    setUserScheme(new CryptoECIES(userSecret));
    setActiveStep(OnboardStatus.FETCHING);
    setIsLoading(false);

    return;
  }

  useEffect(() => {
    async function loadChatHistory(contract: Chat) {
      setIsLoading(true);
      const [chatFromMe, chatFromThem] = await Promise.all([
        contract.queryFilter(contract.filters.ChatInitialized(address, null)),
        contract.queryFilter(contract.filters.ChatInitialized(null, address)),
      ]);
      setIsLoading(false);
      setPreviousPeers(
        chatFromMe
          .map(h => h.args.peer.toLowerCase())
          .concat(chatFromThem.map(h => h.args.initializer.toLowerCase()))
          .filter(p => p.toLowerCase() != address.toLowerCase())
      );
    }

    if (contract && activeStep == OnboardStatus.FETCHING) loadChatHistory(contract);
  }, [activeStep, contract, address]);

  return !(previousPeers && userScheme) ? (
    <Layout centered>
      <Stepper active={activeStep} orientation="vertical">
        {/* check if user is initialized */}
        <Stepper.Step
          label="Checking Initialization"
          description={
            isUserInitialized == undefined
              ? 'Fetching your data...'
              : isUserInitialized
              ? 'Welcome back, ' + addressToUsername(address) + '.'
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
            <Button
              onClick={() => initializeUser(contract!)}
              disabled={isLoading}
              sx={{margin: 'auto', width: '100%'}}
            >{`Initialize (${formatEther(entryFee!)} ETH)`}</Button>
          )}
        </Stepper.Step>

        {/* load chat history for the user */}
        <Stepper.Step
          label="Loading Chat History"
          description="Create an account"
          loading={activeStep == OnboardStatus.FETCHING && isLoading}
        ></Stepper.Step>
      </Stepper>
    </Layout>
  ) : (
    <Dashboard myAddress={address} contract={contract!} userScheme={userScheme} previousPeers={previousPeers} />
  );
};

export default Onboarding;
