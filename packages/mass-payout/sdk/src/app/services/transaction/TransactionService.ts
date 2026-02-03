// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common";
import Service from "../Service";
import { EmptyResponse } from "./error/EmptyResponse";
import { WalletNotSupported } from "./error/WalletNotSupported";
import { SupportedWallets } from "@domain/network/Wallet";
import TransactionResponse from "@domain/transaction/TransactionResponse";
import { Response } from "@domain/transaction/Response";
import { DFNSTransactionAdapter } from "@port/out/hs/hts/custodial/DFNSTransactionAdapter";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import TransactionAdapter from "@port/out/TransactionAdapter";
import { InvalidResponse } from "@core/error/InvalidResponse";
import TransactionHandlerRegistration from "@core/TransactionHandlerRegistration";

@Injectable()
export default class TransactionService extends Service {
  constructor(
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
    private readonly dfnsAdapter: DFNSTransactionAdapter,
  ) {
    super();
  }

  getHandler(): TransactionAdapter {
    return TransactionHandlerRegistration.resolveTransactionHandler();
  }

  setHandler(adp: TransactionAdapter): TransactionAdapter {
    TransactionHandlerRegistration.registerTransactionHandler(adp);
    return adp;
  }

  getHandlerClass(type: SupportedWallets): TransactionAdapter {
    switch (type) {
      case SupportedWallets.DFNS:
        return this.dfnsAdapter;
      default:
        throw new WalletNotSupported();
    }
  }

  async getTransactionResult({
    res,
    result,
    className,
    position,
    numberOfResultsItems,
    isContractCreation,
  }: {
    res: TransactionResponse;
    result?: Response;
    className: string;
    position: number;
    numberOfResultsItems: number;
    isContractCreation?: boolean;
  }): Promise<any> {
    if (!res.id) throw new EmptyResponse(className);

    if (result) {
      return result;
    }

    let results;

    if (isContractCreation) {
      results = await this.mirrorNodeAdapter.getContractResults(res.id.toString(), numberOfResultsItems, true);
    } else {
      results = await this.mirrorNodeAdapter.getContractResults(res.id.toString(), numberOfResultsItems);
    }

    if (!results || results.length !== numberOfResultsItems) {
      throw new InvalidResponse(results);
    }

    return results[position];
  }
}
