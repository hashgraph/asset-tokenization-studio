// SPDX-License-Identifier: Apache-2.0

import { singleton } from "tsyringe";
import Injectable from "@core/injectable/Injectable";
import Service from "@service/Service";
import { QueryBus } from "@core/query/QueryBus";
import { Security } from "@domain/context/security/Security";
import { GetSecurityQuery } from "@query/security/get/GetSecurityQuery";
import { SecurityNotFound } from "./error/SecurityNotFound";

@singleton()
export default class SecurityService extends Service {
  queryBus: QueryBus;
  constructor() {
    super();
  }

  async get(securityId: string): Promise<Security> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const viewModel = (await this.queryBus.execute(new GetSecurityQuery(securityId))).security;
    const { name, decimals, symbol, evmDiamondAddress, isin } = viewModel;
    if (!name || decimals === undefined || !symbol || !isin || !evmDiamondAddress)
      throw new SecurityNotFound(securityId);

    return new Security({
      ...viewModel,
      name,
      decimals,
      symbol,
      isin,
    });
  }
}
