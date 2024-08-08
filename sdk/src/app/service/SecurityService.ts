import { singleton } from 'tsyringe';
import Injectable from '../../core/Injectable.js';
import AccountService from './AccountService.js';
import Service from './Service.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { Security } from '../../domain/context/security/Security.js';
import { GetSecurityQuery } from '../usecase/query/security/get/GetSecurityQuery.js';
import { SecurityNotFound } from '../../port/out/error/SecurityNotFound.js';

@singleton()
export default class SecurityService extends Service {
  queryBus: QueryBus;
  constructor(
    public readonly accountService: AccountService = Injectable.resolve<AccountService>(
      AccountService,
    ),
  ) {
    super();
  }

  async get(securityId: string): Promise<Security> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const viewModel = (
      await this.queryBus.execute(new GetSecurityQuery(securityId))
    ).security;
    const { name, decimals, symbol, isin } = viewModel;
    if (!name || decimals === undefined || !symbol || !isin)
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
