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

import { singleton } from 'tsyringe';
import Injectable from '../../core/Injectable.js';
import { RPCTransactionAdapter } from '../../port/out/rpc/RPCTransactionAdapter.js';
import TransactionAdapter from '../../port/out/TransactionAdapter.js';
import Service from './Service.js';
import { SupportedWallets } from '../../domain/context/network/Wallet';
import { InvalidWalletTypeError } from '../../domain/context/network/error/InvalidWalletAccountTypeError';
import LogService from './LogService.js';
import {
  HederaWalletConnectTransactionAdapter
} from "../../port/out/hs/hederawalletconnect/HederaWalletConnectTransactionAdapter";

@singleton()
export default class TransactionService extends Service {
  constructor() {
    super();
  }

  getHandler(): TransactionAdapter {
    return Injectable.resolveTransactionHandler();
  }

  setHandler(adp: TransactionAdapter): TransactionAdapter {
    Injectable.registerTransactionHandler(adp);
    return adp;
  }

  static getHandlerClass(type: SupportedWallets): TransactionAdapter {
    switch (type) {
      case SupportedWallets.METAMASK:
        if (!Injectable.isWeb()) {
          throw new InvalidWalletTypeError();
        }
        LogService.logTrace('METAMASK TransactionAdapter');
        return Injectable.resolve(RPCTransactionAdapter);
      case SupportedWallets.HWALLETCONNECT:
        if (!Injectable.isWeb()) {
          throw new InvalidWalletTypeError();
        }
        LogService.logTrace('HWALLETCONNECT TransactionAdapter');
        return Injectable.resolve(HederaWalletConnectTransactionAdapter);
      default:
        throw new Error('Invalid wallet type');
    }
  }
}
