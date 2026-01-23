// SPDX-License-Identifier: Apache-2.0

import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import ContractService from "@service/contract/ContractService";
import { GetTokenHoldersAtSnapshotQueryError } from "./error/GetTokenHoldersAtSnapshotQueryError";
import {
  GetTokenHoldersAtSnapshotQuery,
  GetTokenHoldersAtSnapshotQueryResponse,
} from "./GetTokenHoldersAtSnapshotQuery";
import EvmAddress from "@domain/context/contract/EvmAddress";

@QueryHandler(GetTokenHoldersAtSnapshotQuery)
export class GetTokenHoldersAtSnapshotQueryHandler implements IQueryHandler<GetTokenHoldersAtSnapshotQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetTokenHoldersAtSnapshotQuery): Promise<GetTokenHoldersAtSnapshotQueryResponse> {
    try {
      const { securityId, snapshotId, start, end } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      const res = await this.queryAdapter.getTokenHoldersAtSnapshot(securityEvmAddress, snapshotId, start, end);

      const updatedRes = await Promise.all(
        res.map(async (address) => (await this.accountService.getAccountInfo(address)).id.toString()),
      );

      return new GetTokenHoldersAtSnapshotQueryResponse(updatedRes);
    } catch (error) {
      throw new GetTokenHoldersAtSnapshotQueryError(error as Error);
    }
  }
}
