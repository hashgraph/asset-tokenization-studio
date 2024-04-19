import EvmAddress from '../../../../../domain/context/contract/EvmAddress.js';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator.js';
import { QueryHandler } from '../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../core/query/QueryHandler.js';
import { MirrorNodeAdapter } from '../../../../../port/out/mirror/MirrorNodeAdapter.js';
import RPCQueryAdapter from '../../../../../port/out/rpc/RPCQueryAdapter.js';
import {
  GetRegulationDetailsQuery,
  GetRegulationDetailsQueryResponse,
} from './GetRegulationDetailsQuery.js';
import { Regulation } from '../../../../../domain/context/factory/Regulation.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../domain/context/shared/HederaId.js';
import { InvalidRequest } from '../../error/InvalidRequest.js';

@QueryHandler(GetRegulationDetailsQuery)
export class GetRegulationDetailsQueryHandler
  implements IQueryHandler<GetRegulationDetailsQuery>
{
  constructor(
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(
    query: GetRegulationDetailsQuery,
  ): Promise<GetRegulationDetailsQueryResponse> {
    const { type, subType, factory } = query;

    if (!factory) {
      throw new InvalidRequest('Factory not found in request');
    }

    const factoryEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(factory.toString())
        ? (await this.mirrorNodeAdapter.getContractInfo(factory.toString()))
            .evmAddress
        : factory.toString(),
    );

    const regulation: Regulation = await this.queryAdapter.getRegulationDetails(
      type,
      subType,
      factoryEvmAddress,
    );

    return Promise.resolve(new GetRegulationDetailsQueryResponse(regulation));
  }
}
