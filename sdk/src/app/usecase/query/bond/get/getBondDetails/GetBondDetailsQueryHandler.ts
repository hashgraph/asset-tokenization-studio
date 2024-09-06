import { QueryHandler } from '../../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../../core/query/QueryHandler.js';
import { RPCQueryAdapter } from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import {
  GetBondDetailsQuery,
  GetBondDetailsQueryResponse,
} from './GetBondDetailsQuery.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { BondDetails } from '../../../../../../domain/context/bond/BondDetails.js';

@QueryHandler(GetBondDetailsQuery)
export class GetBondDetailsQueryHandler
  implements IQueryHandler<GetBondDetailsQuery>
{
  constructor(
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(
    query: GetBondDetailsQuery,
  ): Promise<GetBondDetailsQueryResponse> {
    const { bondId } = query;

    const bondEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.exec(bondId)
        ? (await this.mirrorNodeAdapter.getContractInfo(bondId)).evmAddress
        : bondId,
    );

    const bond: BondDetails =
      await this.queryAdapter.getBondDetails(bondEvmAddress);

    return Promise.resolve(new GetBondDetailsQueryResponse(bond));
  }
}
