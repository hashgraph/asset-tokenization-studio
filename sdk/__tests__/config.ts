/*
 *
 * Hedera Asset Tokenization Studio SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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

export const DECIMALS = 2;
