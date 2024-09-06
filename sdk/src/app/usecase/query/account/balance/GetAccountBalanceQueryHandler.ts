import { RPCQueryAdapter } from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import {
  GetAccountBalanceQuery,
  GetAccountBalanceQueryResponse,
} from './GetAccountBalanceQuery.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';
import SecurityService from '../../../../../app/service/SecurityService.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../domain/context/shared/HederaId.js';
import EvmAddress from '../../../../../domain/context/contract/EvmAddress.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';

@QueryHandler(GetAccountBalanceQuery)
export class GetAccountBalanceQueryHandler
  implements IQueryHandler<GetAccountBalanceQuery>
{
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {}

  async execute(
    query: GetAccountBalanceQuery,
  ): Promise<GetAccountBalanceQueryResponse> {
    const { securityId, targetId } = query;

    const security = await this.securityService.get(securityId);
    if (!security.evmDiamondAddress) throw new Error('Invalid security id');

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    const targetEvmAddress: EvmAddress = HEDERA_FORMAT_ID_REGEX.test(targetId)
      ? await this.mirrorNodeAdapter.accountToEvmAddress(targetId)
      : new EvmAddress(targetId);

    const res = await this.queryAdapter.balanceOf(
      securityEvmAddress,
      targetEvmAddress,
    );
    const amount = BigDecimal.fromStringFixed(
      res.toString(),
      security.decimals,
    );
    return new GetAccountBalanceQueryResponse(amount);
  }
}
