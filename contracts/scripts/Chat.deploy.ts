import {ethers} from 'hardhat';
import {Chat__factory, Chat} from '../types/typechain';

export default async function main(): Promise<string> {
  console.log('\n[Chat Contract]');
  const factory = (await ethers.getContractFactory('Chat')) as Chat__factory;
  const contract = (await factory.deploy()) as Chat;
  await contract.deployed();
  console.log(`\tContract is deployed at ${contract.address}`);
  return contract.address;
}

if (require.main === module) {
  main();
}
