// SPDX-License-Identifier: Apache-2.0

import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";
import { IQueryHandler } from "@core/query/QueryHandler";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { lazyInject } from "@core/decorator/LazyInjectDecorator";
import { GetLoanDetailsQuery, GetLoanDetailsQueryResponse } from "./GetLoanDetailsQuery";
import AccountService from "@service/account/AccountService";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { LoanDetails } from "@domain/context/loan/LoanDetails";
import { GetLoanDetailsQueryError } from "./error/GetLoanDetailsQueryError";

@QueryHandler(GetLoanDetailsQuery)
export class GetLoanDetailsQueryHandler implements IQueryHandler<GetLoanDetailsQuery> {
  constructor(
    @lazyInject(RPCQueryAdapter)
    private readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(AccountService)
    private readonly accountService: AccountService,
  ) {}

  async execute(query: GetLoanDetailsQuery): Promise<GetLoanDetailsQueryResponse> {
    try {
      const { loanId } = query;

      const loanEvmAddress: EvmAddress = await this.accountService.getAccountEvmAddress(loanId);

      const loan: LoanDetails = await this.queryAdapter.getLoanDetails(loanEvmAddress);

      return Promise.resolve(new GetLoanDetailsQueryResponse(loan));
    } catch (error) {
      throw new GetLoanDetailsQueryError(error as Error);
    }
  }
}
