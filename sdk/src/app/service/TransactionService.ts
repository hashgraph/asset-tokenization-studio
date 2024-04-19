import { singleton } from 'tsyringe';
import Injectable from '../../core/Injectable.js';
import RPCTransactionAdapter from '../../port/out/rpc/RPCTransactionAdapter.js';
import TransactionAdapter from '../../port/out/TransactionAdapter.js';
import Service from './Service.js';

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

  static getHandlerClass(): TransactionAdapter {
    return Injectable.resolve(RPCTransactionAdapter);
  }
}
