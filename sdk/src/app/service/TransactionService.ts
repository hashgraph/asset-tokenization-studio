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
