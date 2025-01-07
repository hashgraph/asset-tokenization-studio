import {
  PartitionsProtectedQuery,
  PartitionsProtectedQueryResponse,
} from './PartitionsProtectedQuery.js';
import { QueryHandler } from '../../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../../core/query/QueryHandler.js';
import { RPCQueryAdapter } from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import SecurityService from '../../../../../service/SecurityService.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';

@QueryHandler(PartitionsProtectedQuery)
export class PartitionsProtectedQueryHandler
  implements IQueryHandler<PartitionsProtectedQuery>
{
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(
    query: PartitionsProtectedQuery,
  ): Promise<PartitionsProtectedQueryResponse> {
    const { securityId } = query;
    const security = await this.securityService.get(securityId);
    if (!security.evmDiamondAddress) throw new Error('Invalid security id');

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    const res =
      await this.queryAdapter.arePartitionsProtected(securityEvmAddress);
    return new PartitionsProtectedQueryResponse(res);
  }
}
