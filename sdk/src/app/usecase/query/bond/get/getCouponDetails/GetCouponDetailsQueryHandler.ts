import { QueryHandler } from '../../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../../core/query/QueryHandler.js';
import { RPCQueryAdapter } from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import {
  GetCouponDetailsQuery,
  GetCouponDetailsQueryResponse,
} from './GetCouponDetailsQuery.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { CouponDetails } from '../../../../../../domain/context/bond/CouponDetails.js';

@QueryHandler(GetCouponDetailsQuery)
export class GetCouponDetailsQueryHandler
  implements IQueryHandler<GetCouponDetailsQuery>
{
  constructor(
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(
    query: GetCouponDetailsQuery,
  ): Promise<GetCouponDetailsQueryResponse> {
    const { bondId } = query;

    const bondEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.exec(bondId)
        ? (await this.mirrorNodeAdapter.getContractInfo(bondId)).evmAddress
        : bondId,
    );

    const coupon: CouponDetails =
      await this.queryAdapter.getCouponDetails(bondEvmAddress);

    return Promise.resolve(new GetCouponDetailsQueryResponse(coupon));
  }
}
