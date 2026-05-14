// SPDX-License-Identifier: Apache-2.0

import { GetNominalValueCurrencyQuery, GetNominalValueCurrencyQueryResponse } from "./GetNominalValueCurrencyQuery";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetNominalValueCurrencyQueryError } from "./error/GetNominalValueCurrencyQueryError";

@QueryHandler(GetNominalValueCurrencyQuery)
export class GetNominalValueCurrencyQueryHandler implements IQueryHandler<GetNominalValueCurrencyQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetNominalValueCurrencyQuery): Promise<GetNominalValueCurrencyQueryResponse> {
    try {
      const { securityId } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const res = await this.queryAdapter.getNominalValueCurrency(securityEvmAddress);
      return new GetNominalValueCurrencyQueryResponse(res);
    } catch (error) {
      throw new GetNominalValueCurrencyQueryError(error as Error);
    }
  }
}
