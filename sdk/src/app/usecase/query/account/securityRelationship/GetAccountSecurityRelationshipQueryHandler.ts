import { HEDERA_FORMAT_ID_REGEX } from '../../../../../domain/context/shared/HederaId.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { RPCQueryAdapter } from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import SecurityService from '../../../../service/SecurityService.js';
import {
  GetAccountSecurityRelationshipQuery,
  GetAccountSecurityRelationshipQueryResponse,
} from './GetAccountSecurityRelationshipQuery.js';
import EvmAddress from '../../../../../domain/context/contract/EvmAddress.js';

@QueryHandler(GetAccountSecurityRelationshipQuery)
export class GetAccountSecurityRelationshipQueryHandler
  implements IQueryHandler<GetAccountSecurityRelationshipQuery>
{
  [x: string]: any;
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNode: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(
    query: GetAccountSecurityRelationshipQuery,
  ): Promise<GetAccountSecurityRelationshipQueryResponse> {
    const { targetId, securityId } = query;

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

    const res = await this.queryAdapter.getAccountSecurityRelationship(
      securityEvmAddress,
      targetEvmAddress,
    );

    return Promise.resolve(
      new GetAccountSecurityRelationshipQueryResponse(res),
    );
  }
}
