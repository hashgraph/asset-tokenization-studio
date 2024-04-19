import { QueryHandler } from '../../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../../core/query/QueryHandler.js';
import RPCQueryAdapter from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import {
  GetEquityDetailsQuery,
  GetEquityDetailsQueryResponse,
} from './GetEquityDetailsQuery.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { EquityDetails } from '../../../../../../domain/context/equity/EquityDetails.js';

@QueryHandler(GetEquityDetailsQuery)
export class GetEquityDetailsQueryHandler
  implements IQueryHandler<GetEquityDetailsQuery>
{
  constructor(
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(
    query: GetEquityDetailsQuery,
  ): Promise<GetEquityDetailsQueryResponse> {
    const { equityId } = query;

    const equityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.exec(equityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(equityId)).evmAddress
        : equityId,
    );

    const equity: EquityDetails =
      await this.queryAdapter.getEquityDetails(equityEvmAddress);

    return Promise.resolve(new GetEquityDetailsQueryResponse(equity));
  }
}
