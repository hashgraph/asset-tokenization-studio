// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { GetCouponsOrderedListQuery, GetCouponsOrderedListQueryResponse } from "./GetCouponsOrderedListQuery";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { GetCouponsOrderedListQueryError } from "./error/GetCouponsOrderedListQueryError";

@QueryHandler(GetCouponsOrderedListQuery)
export class GetCouponsOrderedListQueryHandler implements IQueryHandler<GetCouponsOrderedListQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetCouponsOrderedListQuery): Promise<GetCouponsOrderedListQueryResponse> {
    try {
      const { securityId, pageIndex, pageLength } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);

      // Obtener los coupon IDs ordenados usando el QueryAdapter
      const couponIds = await this.queryAdapter.getCouponsOrderedList(securityEvmAddress, pageIndex, pageLength);

      return new GetCouponsOrderedListQueryResponse(couponIds);
    } catch (error) {
      throw new GetCouponsOrderedListQueryError(error as Error);
    }
  }
}
