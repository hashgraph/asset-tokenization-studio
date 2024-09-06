import AccountViewModel from './response/AccountViewModel.js';
import GetAccountInfoRequest from './request/GetAccountInfoRequest.js';
import GetAccountBalanceRequest from './request/GetAccountBalanceRequest.js';
import { handleValidation } from './Common.js';
import { GetAccountInfoQuery } from '../../app/usecase/query/account/info/GetAccountInfoQuery.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import Injectable from '../../core/Injectable.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import { GetAccountBalanceQuery } from '../../app/usecase/query/account/balance/GetAccountBalanceQuery.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';

interface IAccountInPort {
  getInfo(request: GetAccountInfoRequest): Promise<AccountViewModel>;
}

class AccountInPort implements IAccountInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
  ) {}

  @LogError
  async getInfo(request: GetAccountInfoRequest): Promise<AccountViewModel> {
    handleValidation('GetAccountInfoRequest', request);
    const res = await this.queryBus.execute(
      new GetAccountInfoQuery(HederaId.from(request.account.accountId)),
    );
    const account: AccountViewModel = {
      id: res.account.id.toString(),
      accountEvmAddress: res.account.evmAddress,
      publicKey: res.account.publicKey ? res.account.publicKey : undefined,
      alias: res.account.alias,
    };

    return account;
  }

  @LogError
  async getBalance(request: GetAccountBalanceRequest): Promise<BigDecimal> {
    handleValidation('GetAccountBalanceRequest', request);
    const res = await this.queryBus.execute(
      new GetAccountBalanceQuery(request.securityId, request.targetId),
    );
    return res.payload;
  }
}

const Account = new AccountInPort();
export default Account;
