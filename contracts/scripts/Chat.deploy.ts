import {ethers} from 'hardhat';
//@ts-ignore // the objects here are created by typechain
import {Chat__factory, Chat} from '../types/typechain';
import contractConstants from '../constants';

export default async function main(): Promise<string> {
  console.log(`\n[Chat Contract]`);
  const factory = (await ethers.getContractFactory('Chat')) as Chat__factory;
  let contract = (await factory.deploy()) as Chat;
  await contract.deployed();
  console.log(`\tContract is deployed at ${contract.address}`);
  return contract.address;
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
