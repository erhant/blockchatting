import {parseEther} from 'ethers/lib/utils';

const contractConstants = {
  Chat: {
    entryFee: parseEther('0.001'),
    aliasFee: parseEther('0.0075'),
  },
};

export default contractConstants as Readonly<typeof contractConstants>;
