// SPDX-License-Identifier: Apache-2.0

import { singleton } from "tsyringe";
import Injectable from "@core/injectable/Injectable";
import { RPCTransactionAdapter } from "@port/out/rpc/RPCTransactionAdapter";
import TransactionAdapter from "@port/out/TransactionAdapter";
import Service from "@service/Service";
import { SupportedWallets } from "@domain/context/network/Wallet";
import { InvalidWalletTypeError } from "@domain/context/network/error/InvalidWalletAccountTypeError";
import LogService from "@service/log/LogService";
import { HederaWalletConnectTransactionAdapter } from "@port/out/hs/walletconnect/HederaWalletConnectTransactionAdapter";
import { DFNSTransactionAdapter } from "@port/out/hs/custodial/DFNSTransactionAdapter";
import { FireblocksTransactionAdapter } from "@port/out/hs/custodial/FireblocksTransactionAdapter";
import { AWSKMSTransactionAdapter } from "@port/out/hs/custodial/AWSKMSTransactionAdapter";
import { WalletNotSupported } from "./error/WalletNotSupported";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { InvalidResponse } from "@core/error/InvalidResponse";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { EmptyResponse } from "./error/EmptyResponse";
import { Response } from "@domain/context/transaction/Response";
import { ADDRESS_LENGTH, BYTES_32_LENGTH } from "@core/Constants";

@singleton()
export default class TransactionService extends Service {
  constructor(private readonly mirrorNodeAdapter: MirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter)) {
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
        LogService.logTrace("METAMASK TransactionAdapter");
        return Injectable.resolve(RPCTransactionAdapter);
      case SupportedWallets.HWALLETCONNECT:
        if (!Injectable.isWeb()) {
          throw new InvalidWalletTypeError();
        }
        LogService.logTrace("HWALLETCONNECT TransactionAdapter");
        return Injectable.resolve(HederaWalletConnectTransactionAdapter);
      case SupportedWallets.DFNS:
        LogService.logTrace("DFNS TransactionAdapter");
        return Injectable.resolve(DFNSTransactionAdapter);
      case SupportedWallets.FIREBLOCKS:
        LogService.logTrace("FIREBLOCKS TransactionAdapter");
        return Injectable.resolve(FireblocksTransactionAdapter);
      case SupportedWallets.AWSKMS:
        LogService.logTrace("AWSKMS TransactionAdapter");
        return Injectable.resolve(AWSKMSTransactionAdapter);
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
  }): Promise<string> {
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

    if (
      [
        "CreateEquityCommandHandler",
        "CreateBondCommandHandler",
        "CreateBondFixedRateCommandHandler",
        "CreateBondKpiLinkedRateCommandHandler",
        "CreateTrexSuiteBondCommandHandler",
        "CreateTrexSuiteEquityCommandHandler",
        "SetRateCommandHandler",
      ].some((handler) => className.includes(handler))
    ) {
      const data = results.map((result) => result.substring(BYTES_32_LENGTH - ADDRESS_LENGTH + 2));
      return `0x${data[position]}`;
    }

    return results[position];
  }
}
