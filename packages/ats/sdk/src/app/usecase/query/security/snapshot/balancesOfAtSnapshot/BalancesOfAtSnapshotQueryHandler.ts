// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { BalancesOfAtSnapshotQueryError } from "./error/BalancesOfAtSnapshotQueryError";
import { BalancesOfAtSnapshotQuery, BalancesOfAtSnapshotQueryResponse } from "./BalancesOfAtSnapshotQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(BalancesOfAtSnapshotQuery)
export class BalancesOfAtSnapshotQueryHandler implements IQueryHandler<BalancesOfAtSnapshotQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: BalancesOfAtSnapshotQuery): Promise<BalancesOfAtSnapshotQueryResponse> {
    try {
      const { securityId, snapshotId, pageIndex, pageLength } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.balancesOfAtSnapshot(securityEvmAddress, snapshotId, pageIndex, pageLength);

      return new BalancesOfAtSnapshotQueryResponse(res);
    } catch (error) {
      throw new BalancesOfAtSnapshotQueryError(error as Error);
    }
  }
}
