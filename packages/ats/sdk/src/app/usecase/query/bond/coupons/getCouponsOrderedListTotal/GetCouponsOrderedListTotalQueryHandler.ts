// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import {
  GetCouponsOrderedListTotalQuery,
  GetCouponsOrderedListTotalQueryResponse,
} from "./GetCouponsOrderedListTotalQuery";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetCouponsOrderedListTotalQueryError } from "./error/GetCouponsOrderedListTotalQueryError";

@QueryHandler(GetCouponsOrderedListTotalQuery)
export class GetCouponsOrderedListTotalQueryHandler implements IQueryHandler<GetCouponsOrderedListTotalQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetCouponsOrderedListTotalQuery): Promise<GetCouponsOrderedListTotalQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      // Obtener el total de coupons usando el QueryAdapter
      const total = await this.queryAdapter.getCouponsOrderedListTotal(securityEvmAddress);

      return new GetCouponsOrderedListTotalQueryResponse(total);
    } catch (error) {
      throw new GetCouponsOrderedListTotalQueryError(error as Error);
    }
  }
}
