import { IQueryHandler } from '../../../../../../core/query/QueryHandler.js';
import { QueryHandler } from '../../../../../../core/decorator/QueryHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import SecurityService from '../../../../../service/SecurityService.js';
import {
  GetControlListMembersQuery,
  GetControlListMembersQueryResponse,
} from './GetControlListMembersQuery.js';
import RPCQueryAdapter from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';

@QueryHandler(GetControlListMembersQuery)
export class GetControlListMembersQueryHandler
  implements IQueryHandler<GetControlListMembersQuery>
{
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {}

  async execute(
    query: GetControlListMembersQuery,
  ): Promise<GetControlListMembersQueryResponse> {
    const { securityId, start, end } = query;
    const security = await this.securityService.get(securityId);
    if (!security.evmDiamondAddress) throw new Error('Invalid security id');

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    const res = await this.queryAdapter.getControlListMembers(
      securityEvmAddress,
      start,
      end,
    );

    return new GetControlListMembersQueryResponse(res);
  }
}
