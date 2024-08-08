export const testnet = 'testnet';
export const previewnet = 'previewnet';
export const mainnet = 'mainnet';
export const local = 'local';
export const unrecognized = 'unrecognized';

export type Environment =
  | 'testnet'
  | 'previewnet'
  | 'mainnet'
  | 'local'
  | 'unrecognized'
  | string;

export const HederaNetworks = [
  {
    network: testnet,
    chainId: 296,
  },
  {
    network: previewnet,
    chainId: 297,
  },
  {
    network: mainnet,
    chainId: 295,
  },
  {
    network: local,
    chainId: 298,
  },
];
