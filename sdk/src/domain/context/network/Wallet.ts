import Account from '../account/Account.js';

export enum SupportedWallets {
  METAMASK = 'Metamask',
  HASHPACK = 'HashPack',
  HWALLETCONNECT = 'HWALLETCONNECT',
  //CLIENT = 'Client',
}

export default interface Wallet {
  type: SupportedWallets;
  account: Account;
  // Events...
}
