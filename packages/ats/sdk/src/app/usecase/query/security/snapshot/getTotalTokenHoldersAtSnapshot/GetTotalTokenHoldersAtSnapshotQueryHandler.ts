// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import ContractService from "@service/contract/ContractService";
import { GetTotalTokenHoldersAtSnapshotQueryError } from "./error/GetTotalTokenHoldersAtSnapshotQueryError";
import {
  GetTotalTokenHoldersAtSnapshotQuery,
  GetTotalTokenHoldersAtSnapshotQueryResponse,
} from "./GetTotalTokenHoldersAtSnapshotQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(GetTotalTokenHoldersAtSnapshotQuery)
export class GetTotalTokenHoldersAtSnapshotQueryHandler implements IQueryHandler<GetTotalTokenHoldersAtSnapshotQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetTotalTokenHoldersAtSnapshotQuery): Promise<GetTotalTokenHoldersAtSnapshotQueryResponse> {
    try {
      const { securityId, snapshotId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getTotalTokenHoldersAtSnapshot(securityEvmAddress, snapshotId);

      return new GetTotalTokenHoldersAtSnapshotQueryResponse(res);
    } catch (error) {
      throw new GetTotalTokenHoldersAtSnapshotQueryError(error as Error);
    }
  }
}
