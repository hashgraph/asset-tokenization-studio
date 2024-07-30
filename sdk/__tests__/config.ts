import Account from '../src/domain/context/account/Account.js';
import PrivateKey from '../src/domain/context/account/PrivateKey.js';
import PublicKey from '../src/domain/context/account/PublicKey.js';
import { HederaId } from '../src/domain/context/shared/HederaId.js';
import { config } from 'dotenv';

config();

export const ENVIRONMENT = 'testnet';
export const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS ?? '';
export const RESOLVER_ADDRESS = process.env.RESOLVER_ADDRESS ?? '';
export const BUSINESS_LOGIC_KEYS_COMMON: string[] = process.env
  .BUSINESS_LOGIC_KEYS_COMMON
  ? process.env.BUSINESS_LOGIC_KEYS_COMMON.split(',')
  : [];
export const BUSINESS_LOGIC_KEYS_EQUITY: string[] = process.env
  .BUSINESS_LOGIC_KEYS_EQUITY
  ? process.env.BUSINESS_LOGIC_KEYS_EQUITY.split(',')
  : [];
export const BUSINESS_LOGIC_KEYS_BOND: string[] = process.env
  .BUSINESS_LOGIC_KEYS_BOND
  ? process.env.BUSINESS_LOGIC_KEYS_BOND.split(',')
  : [];

export const CLIENT_PRIVATE_KEY_ECDSA = new PrivateKey({
  key: process.env.CLIENT_PRIVATE_KEY_ECDSA_1 ?? '',
  type: 'ECDSA',
});
export const CLIENT_PUBLIC_KEY_ECDSA = new PublicKey({
  key: process.env.CLIENT_PUBLIC_KEY_ECDSA_1 ?? '',
  type: 'ECDSA',
});
export const CLIENT_EVM_ADDRESS_ECDSA =
  process.env.CLIENT_EVM_ADDRESS_ECDSA_1 ?? '';
export const CLIENT_ACCOUNT_ID_ECDSA =
  process.env.CLIENT_ACCOUNT_ID_ECDSA_1 ?? '';
export const CLIENT_ACCOUNT_ECDSA: Account = new Account({
  id: CLIENT_ACCOUNT_ID_ECDSA,
  evmAddress: CLIENT_EVM_ADDRESS_ECDSA,
  privateKey: CLIENT_PRIVATE_KEY_ECDSA,
  publicKey: CLIENT_PUBLIC_KEY_ECDSA,
});
export const HEDERA_ID_ACCOUNT_ECDSA = HederaId.from(CLIENT_ACCOUNT_ID_ECDSA);

// DEMO ACCOUNTs

// Account Z
export const CLIENT_PRIVATE_KEY_ECDSA_Z = new PrivateKey({
  key: process.env.CLIENT_PRIVATE_KEY_ECDSA_1 ?? '',
  type: 'ECDSA',
});
export const CLIENT_PUBLIC_KEY_ECDSA_Z = new PublicKey({
  key: process.env.CLIENT_PUBLIC_KEY_ECDSA_1 ?? '',
  type: 'ECDSA',
});
export const CLIENT_EVM_ADDRESS_ECDSA_Z =
  process.env.CLIENT_EVM_ADDRESS_ECDSA_1 ?? '';
export const CLIENT_ACCOUNT_ID_ECDSA_Z =
  process.env.CLIENT_ACCOUNT_ID_ECDSA_1 ?? '';
export const CLIENT_ACCOUNT_ECDSA_Z: Account = new Account({
  id: CLIENT_ACCOUNT_ID_ECDSA_Z,
  evmAddress: CLIENT_EVM_ADDRESS_ECDSA_Z,
  privateKey: CLIENT_PRIVATE_KEY_ECDSA_Z,
  publicKey: CLIENT_PUBLIC_KEY_ECDSA_Z,
});
export const HEDERA_ID_ACCOUNT_ECDSA_Z = HederaId.from(
  CLIENT_ACCOUNT_ID_ECDSA_Z,
);

// Account A
export const CLIENT_PRIVATE_KEY_ECDSA_A = new PrivateKey({
  key: process.env.CLIENT_PRIVATE_KEY_ECDSA_2 ?? '',
  type: 'ECDSA',
});
export const CLIENT_PUBLIC_KEY_ECDSA_A = new PublicKey({
  key: process.env.CLIENT_PUBLIC_KEY_ECDSA_2 ?? '',
  type: 'ECDSA',
});
export const CLIENT_EVM_ADDRESS_ECDSA_A =
  process.env.CLIENT_EVM_ADDRESS_ECDSA_2 ?? '';
export const CLIENT_ACCOUNT_ID_ECDSA_A =
  process.env.CLIENT_ACCOUNT_ID_ECDSA_2 ?? '';
export const CLIENT_ACCOUNT_ECDSA_A: Account = new Account({
  id: CLIENT_ACCOUNT_ID_ECDSA_A,
  evmAddress: CLIENT_EVM_ADDRESS_ECDSA_A,
  privateKey: CLIENT_PRIVATE_KEY_ECDSA_A,
  publicKey: CLIENT_PUBLIC_KEY_ECDSA_A,
});
export const HEDERA_ID_ACCOUNT_ECDSA_A = HederaId.from(
  CLIENT_ACCOUNT_ID_ECDSA_A,
);

// Account B
export const CLIENT_PRIVATE_KEY_ECDSA_B = new PrivateKey({
  key: process.env.CLIENT_PRIVATE_KEY_ECDSA_3 ?? '',
  type: 'ECDSA',
});
export const CLIENT_PUBLIC_KEY_ECDSA_B = new PublicKey({
  key: process.env.CLIENT_PUBLIC_KEY_ECDSA_3 ?? '',
  type: 'ECDSA',
});
export const CLIENT_EVM_ADDRESS_ECDSA_B =
  process.env.CLIENT_EVM_ADDRESS_ECDSA_3 ?? '';
export const CLIENT_ACCOUNT_ID_ECDSA_B =
  process.env.CLIENT_ACCOUNT_ID_ECDSA_3 ?? '';
export const CLIENT_ACCOUNT_ECDSA_B: Account = new Account({
  id: CLIENT_ACCOUNT_ID_ECDSA_B,
  evmAddress: CLIENT_EVM_ADDRESS_ECDSA_B,
  privateKey: CLIENT_PRIVATE_KEY_ECDSA_B,
  publicKey: CLIENT_PUBLIC_KEY_ECDSA_B,
});
export const HEDERA_ID_ACCOUNT_ECDSA_B = HederaId.from(
  CLIENT_ACCOUNT_ID_ECDSA_B,
);

// Account C
export const CLIENT_PRIVATE_KEY_ECDSA_C = new PrivateKey({
  key: process.env.CLIENT_PRIVATE_KEY_ECDSA_4 ?? '',
  type: 'ECDSA',
});
export const CLIENT_PUBLIC_KEY_ECDSA_C = new PublicKey({
  key: process.env.CLIENT_PUBLIC_KEY_ECDSA_4 ?? '',
  type: 'ECDSA',
});
export const CLIENT_EVM_ADDRESS_ECDSA_C =
  process.env.CLIENT_EVM_ADDRESS_ECDSA_4 ?? '';
export const CLIENT_ACCOUNT_ID_ECDSA_C =
  process.env.CLIENT_ACCOUNT_ID_ECDSA_4 ?? '';
export const CLIENT_ACCOUNT_ECDSA_C: Account = new Account({
  id: CLIENT_ACCOUNT_ID_ECDSA_C,
  evmAddress: CLIENT_EVM_ADDRESS_ECDSA_C,
  privateKey: CLIENT_PRIVATE_KEY_ECDSA_C,
  publicKey: CLIENT_PUBLIC_KEY_ECDSA_C,
});
export const HEDERA_ID_ACCOUNT_ECDSA_C = HederaId.from(
  CLIENT_ACCOUNT_ID_ECDSA_C,
);

export const DECIMALS = 2;
