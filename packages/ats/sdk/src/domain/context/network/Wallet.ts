// SPDX-License-Identifier: Apache-2.0

import Account from "../account/Account";

export enum SupportedWallets {
  METAMASK = "Metamask",
  HWALLETCONNECT = "HWALLETCONNECT",
  // HASHPACK = 'HashPack',
  //CLIENT = 'Client',
  DFNS = "DFNS",
  FIREBLOCKS = "Fireblocks",
  AWSKMS = "AWSKMS",
}

export default interface Wallet {
  type: SupportedWallets;
  account: Account;
  // Events...
}
