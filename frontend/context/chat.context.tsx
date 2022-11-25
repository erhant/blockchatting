import {Chat__factory, Chat as ChatContract} from '../types/typechain/';
import {createContext, FC, ReactNode, useContext, useEffect, useState} from 'react';
import {notify, notifyError} from '../utils/notify';
import getContractAddress from '../constants/addresses';
import {truncateAddress} from '../utils/utility';
import {useNetwork, useSigner} from 'wagmi';

const ChatContext = createContext<{contract: ChatContract | undefined}>({contract: undefined});

// This context provides the chat contract object to those who consume it.
export const ChatContextWrapper: FC<{children: ReactNode}> = ({children}) => {
  const {data} = useSigner();
  const {chain} = useNetwork();
  const [contract, setContract] = useState<ChatContract>();

  useEffect(() => {
    if (data && data.provider && chain) {
      try {
        // get the address w.r.t chainID, this is set by the programmer in another file
        const contractAddress = getContractAddress('Chat', chain.id);
        // get the contract from factory
        const contract: ChatContract = Chat__factory.connect(contractAddress, data);
        data.provider.getCode(contract.address).then(code => {
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
  }, [data, chain]);

  return <ChatContext.Provider value={{contract}}>{children}</ChatContext.Provider>;
};

// custom hook
export function useChatContext() {
  return useContext(ChatContext);
}
