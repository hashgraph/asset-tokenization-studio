import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import { QueryHandler } from '../../../../../../core/decorator/QueryHandlerDecorator.js';
import { IQueryHandler } from '../../../../../../core/query/QueryHandler.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import RPCQueryAdapter from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import SecurityService from '../../../../../service/SecurityService.js';
import { GetCouponQuery, GetCouponQueryResponse } from './GetCouponQuery.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';

@QueryHandler(GetCouponQuery)
export class GetCouponQueryHandler implements IQueryHandler<GetCouponQuery> {
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(MirrorNodeAdapter)
    public readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(query: GetCouponQuery): Promise<GetCouponQueryResponse> {
    const { securityId, couponId } = query;

    const security = await this.securityService.get(securityId);
    if (!security.evmDiamondAddress) throw new Error('Invalid security id');

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.exec(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId,
    );

    const res = await this.queryAdapter.getCoupon(securityEvmAddress, couponId);

    return Promise.resolve(new GetCouponQueryResponse(res));
  }
}
