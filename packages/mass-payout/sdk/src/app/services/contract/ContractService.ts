// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common";
import { QueryBus } from "@core/query/QueryBus";
import NetworkService from "../network/NetworkService";
import Service from "../Service";
import TransactionService from "../transaction/TransactionService";
import EvmAddress from "@domain/contract/EvmAddress";
import { HEDERA_FORMAT_ID_REGEX } from "@domain/shared/HederaId";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";

@Injectable()
export default class ContractService extends Service {
  queryBus: QueryBus;

  constructor(
    private readonly networkService: NetworkService,
    private readonly transactionService: TransactionService,
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {
    super();
  }

  async getContractEvmAddress(contractId: string): Promise<EvmAddress> {
    const evmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(contractId)
        ? (await this.mirrorNodeAdapter.getContractInfo(contractId)).evmAddress
        : contractId.toString(),
    );

    return evmAddress;
  }

  async getEvmAddressesFromHederaIds(addresses?: string[]): Promise<EvmAddress[]> {
    if (!addresses) return [];
    return Promise.all(addresses.map((address) => this.getContractEvmAddress(address.toString())));
  }
}
