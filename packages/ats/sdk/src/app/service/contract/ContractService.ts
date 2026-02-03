// SPDX-License-Identifier: Apache-2.0

import { singleton } from "tsyringe";
import Injectable from "@core/injectable/Injectable";
import { QueryBus } from "@core/query/QueryBus";
import NetworkService from "@service/network/NetworkService";
import Service from "@service/Service";
import TransactionService from "@service/transaction/TransactionService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { HEDERA_FORMAT_ID_REGEX } from "@domain/context/shared/HederaId";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
@singleton()
export default class ContractService extends Service {
  queryBus: QueryBus;

  constructor(
    public readonly networkService: NetworkService = Injectable.resolve(NetworkService),
    public readonly transactionService: TransactionService = Injectable.resolve(TransactionService),
    public readonly mirrorNodeAdapter: MirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter),
  ) {
    super();
  }

  async getContractEvmAddress(contractId: string): Promise<EvmAddress> {
    return new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(contractId)
        ? (await this.mirrorNodeAdapter.getContractInfo(contractId)).evmAddress
        : contractId.toString(),
    );
  }

  async getEvmAddressesFromHederaIds(addresses?: string[]): Promise<EvmAddress[]> {
    if (!addresses) return [];
    return Promise.all(addresses.map((address) => this.getContractEvmAddress(address.toString())));
  }
}
