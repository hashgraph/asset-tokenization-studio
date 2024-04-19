import {
  GetMaxSupplyQuery,
  GetMaxSupplyQueryResponse,
} from './GetMaxSupplyQuery.js';
import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import RPCQueryAdapter from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import SecurityService from '../../../../service/SecurityService.js';
import BigDecimal from '../../../../../domain/context/shared/BigDecimal.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../domain/context/shared/HederaId.js';
import EvmAddress from '../../../../../domain/context/contract/EvmAddress.js';

@QueryHandler(GetMaxSupplyQuery)
export class GetMaxSupplyQueryHandler
  implements IQueryHandler<GetMaxSupplyQuery>
{
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: GetMaxSupplyQuery): Promise<GetMaxSupplyQueryResponse> {
    const { securityId } = query;
    const security = await this.securityService.get(securityId);
    if (!security.evmDiamondAddress) throw new Error('Invalid security id');

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.exec(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    const res = await this.queryAdapter.getMaxSupply(securityEvmAddress);
    const amount = BigDecimal.fromStringFixed(
      res.toString(),
      security.decimals,
    );
    return new GetMaxSupplyQueryResponse(amount);
  }
}
