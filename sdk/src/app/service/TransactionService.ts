import { singleton } from 'tsyringe';
import Injectable from '../../core/Injectable.js';
import { RPCTransactionAdapter } from '../../port/out/rpc/RPCTransactionAdapter.js';
import TransactionAdapter from '../../port/out/TransactionAdapter.js';
import Service from './Service.js';
import {SupportedWallets} from "../../domain/context/network/Wallet";
import {HashpackTransactionAdapter} from "../../port/out/hs/hashpack/HashpackTransactionAdapter";
import {InvalidWalletTypeError} from "../../domain/context/network/error/InvalidWalletAccountTypeError";

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
      case SupportedWallets.HASHPACK:
        if (!Injectable.isWeb()) {
          throw new InvalidWalletTypeError();
        }
        console.log('HashpackTransactionAdapter');
        return Injectable.resolve(HashpackTransactionAdapter);
      case SupportedWallets.METAMASK:
        if (!Injectable.isWeb()) {
          throw new InvalidWalletTypeError();
        }
        console.log('RPCTransactionAdapter');
        return Injectable.resolve(RPCTransactionAdapter);
    }
  }
}
