// SPDX-License-Identifier: Apache-2.0

import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import {
  GetAmortizationPaymentAmountQuery,
  GetAmortizationPaymentAmountQueryResponse,
} from "./GetAmortizationPaymentAmountQuery";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { GetAmortizationPaymentAmountQueryError } from "./error/GetAmortizationPaymentAmountQueryError";

@QueryHandler(GetAmortizationPaymentAmountQuery)
export class GetAmortizationPaymentAmountQueryHandler implements IQueryHandler<GetAmortizationPaymentAmountQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
    @lazyInject(ContractService)
    private readonly contractService: ContractService,
  ) {}

  async execute(query: GetAmortizationPaymentAmountQuery): Promise<GetAmortizationPaymentAmountQueryResponse> {
    try {
      const { securityId, amortizationId, tokenHolder } = query;

      const securityEvmAddress: EvmAddress = await this.contractService.getContractEvmAddress(securityId);
      const tokenHolderEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(tokenHolder);

      const res = await this.queryAdapter.getAmortizationPaymentAmount(
        securityEvmAddress,
        amortizationId,
        tokenHolderEvmAddress,
      );

      return new GetAmortizationPaymentAmountQueryResponse(res);
    } catch (error) {
      throw new GetAmortizationPaymentAmountQueryError(error as Error);
    }
  }
}
