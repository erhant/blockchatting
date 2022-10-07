import {TypedListener} from './typechain/common';
import {MessageSentEvent} from './typechain/contracts/Chat';

// MessageSent event listener will be of this type
export type MessageSentListener = TypedListener<MessageSentEvent>;

// Messages are of this type
export type MessageType = {
  own: boolean; // are you the message sender?
  message: string; // the decrypted message
  time: number; // timestamp of the message
};
