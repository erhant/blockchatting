import {BigNumber} from 'ethers';

// truncates an address
export function truncateAddress(acc: string): string {
  if (acc !== '') return acc.slice(0, 5) + '...' + acc.slice(-3);
  else return '';
}

// returns a random unique string
export function randomUniqueString(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}
