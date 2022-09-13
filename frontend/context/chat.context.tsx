import {useWalletContext} from '../context/wallet.context';
import {Chat__factory, Chat as ChatContract} from '../types/typechain/';
import {createContext, FC, ReactNode, useContext, useEffect, useState} from 'react';
import {notify, notifyError} from '../utils/notify';
import getContractAddress from '../constants/addresses';
import {truncateAddress} from '../utils/utility';

const ChatContext = createContext<{contract: ChatContract | undefined}>({contract: undefined});

export const ChatContextWrapper: FC<{children: ReactNode}> = ({children}) => {
  const {wallet} = useWalletContext();
  const [contract, setContract] = useState<ChatContract>();

  useEffect(() => {
    if (wallet) {
      try {
        // get the address w.r.t chainID, this is set by the programmer in another file
        const contractAddress = getContractAddress('Chat', wallet.chainId);
        // get the contract from factory
        const contract: ChatContract = Chat__factory.connect(contractAddress, wallet.library.getSigner(wallet.address));
        wallet.library.getCode(contract.address).then(code => {
          if (code != '0x') {
            notify('Contract Connected', 'Connected to ' + truncateAddress(contractAddress), 'success');
            setContract(contract);
          } else {
            notify('Contract Not Deployed', 'Could not find any code at ' + truncateAddress(contractAddress), 'error');
          }
        });
      } catch (e: any) {
        notifyError(e, 'Contract Not Found', false);
      }
    }

    return () => {
      setContract(undefined);
    };
  }, [wallet]);

  return <ChatContext.Provider value={{contract}}>{children}</ChatContext.Provider>;
};

// custom hook
export function useChatContext() {
  return useContext(ChatContext);
}
