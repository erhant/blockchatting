import {BigNumber} from 'ethers';

// truncates an address
export function truncateAddress(acc: string): string {
  if (acc !== '') return acc.slice(0, 5) + '...' + acc.slice(-3);
  else return '';
}

// converts a decimal number to hexadecimal
export function decimalToHex(dec: number): number {
  return parseInt(dec.toString(16));
}

// converts a hexadecimal number to decimal
export function hexToDecimal(hex: number): number {
  return parseInt(hex.toString(), 16);
}

// converts a block timestamp number to a date object
export function blockTimestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000); // converts to ms, and then to number
}

// converts a block timestamp bignumber to a date object
export function blockBigTimestampToDate(timestamp: BigNumber): Date {
  return new Date(timestamp.mul(1000).toNumber()); // converts to ms, and then to number
}

// returns a random unique string
export function randomUniqueString(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}
