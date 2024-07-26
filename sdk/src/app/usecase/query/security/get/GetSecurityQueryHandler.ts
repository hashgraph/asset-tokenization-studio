import { Security } from '../../../../../domain/context/security/Security.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { RPCQueryAdapter } from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import {
  GetSecurityQuery,
  GetSecurityQueryResponse,
} from './GetSecurityQuery.js';
import EvmAddress from '../../../../../domain/context/contract/EvmAddress.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../domain/context/shared/HederaId.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';

@QueryHandler(GetSecurityQuery)
export class GetSecurityQueryHandler
  implements IQueryHandler<GetSecurityQuery>
{
  constructor(
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: GetSecurityQuery): Promise<GetSecurityQueryResponse> {
    const { securityId } = query;

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    const security: Security =
      await this.queryAdapter.getSecurity(securityEvmAddress);
    if (!security.evmDiamondAddress)
      throw new Error('Invalid security address');

    if (security.maxSupply)
      security.maxSupply = BigDecimal.fromStringFixed(
        security.maxSupply.toString(),
        security.decimals,
      );
    if (security.totalSupply)
      security.totalSupply = BigDecimal.fromStringFixed(
        security.totalSupply.toString(),
        security.decimals,
      );

    return Promise.resolve(new GetSecurityQueryResponse(security));
  }
}
