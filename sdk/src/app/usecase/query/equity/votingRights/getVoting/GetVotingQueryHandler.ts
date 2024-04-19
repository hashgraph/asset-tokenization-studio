import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { QueryHandler } from '../../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../../core/query/QueryHandler.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import RPCQueryAdapter from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import SecurityService from '../../../../../service/SecurityService.js';
import { GetVotingQuery, GetVotingQueryResponse } from './GetVotingQuery.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';

@QueryHandler(GetVotingQuery)
export class GetVotingQueryHandler implements IQueryHandler<GetVotingQuery> {
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: GetVotingQuery): Promise<GetVotingQueryResponse> {
    const { securityId, votingId } = query;

    const security = await this.securityService.get(securityId);
    if (!security.evmDiamondAddress) throw new Error('Invalid security id');

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.exec(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId,
    );

    const res = await this.queryAdapter.getVoting(securityEvmAddress, votingId);

    return Promise.resolve(new GetVotingQueryResponse(res));
  }
}
