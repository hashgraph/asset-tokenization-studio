import { GetBondDetailsQuery } from '../../app/usecase/query/bond/get/getBondDetails/GetBondDetailsQuery.js';
import { GetCouponDetailsQuery } from '../../app/usecase/query/bond/get/getCouponDetails/GetCouponDetailsQuery.js';
import Injectable from '../../core/Injectable.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { handleValidation } from './Common.js';
import GetBondDetailsRequest from './request/GetBondDetailsRequest.js';
import GetCouponDetailsRequest from './request/GetCouponDetailsRequest.js';
import BondDetailsViewModel from './response/BondDetailsViewModel.js';
import CouponDetailsViewModel from './response/CouponDetailsViewModel.js';
import CouponViewModel from './response/CouponViewModel.js';
import CouponForViewModel from './response/CouponForViewModel.js';
import GetAllCouponsRequest from './request/GetAllCouponsRequest.js';
import GetCouponForRequest from './request/GetCouponForRequest.js';
import GetCouponRequest from './request/GetCouponRequest.js';
import { GetCouponForQuery } from '../../app/usecase/query/bond/coupons/getCouponFor/GetCouponForQuery.js';
import { GetCouponQuery } from '../../app/usecase/query/bond/coupons/getCoupon/GetCouponQuery.js';
import { GetCouponCountQuery } from '../../app/usecase/query/bond/coupons/getCouponCount/GetCouponCountQuery.js';
import { ONE_THOUSAND } from '../../domain/context/shared/SecurityDate.js';
import CreateBondRequest from './request/CreateBondRequest.js';
import { SecurityViewModel } from './Security.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import NetworkService from '../../app/service/NetworkService.js';
import { SecurityProps } from '../../domain/context/security/Security.js';
import { CreateBondCommand } from '../../app/usecase/command/bond/create/CreateBondCommand.js';
import ContractId from '../../domain/context/contract/ContractId.js';
import { GetSecurityQuery } from '../../app/usecase/query/security/get/GetSecurityQuery.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import SetCouponRequest from './request/SetCouponRequest.js';
import { SetCouponCommand } from '../../app/usecase/command/bond/coupon/set/SetCouponCommand.js';
import {
  CastRegulationSubType,
  CastRegulationType,
} from '../../domain/context/factory/RegulationType.js';

interface IBondInPort {
  create(request: CreateBondRequest): Promise<{
    security: SecurityViewModel;
  }>;
  getBondDetails(request: GetBondDetailsRequest): Promise<BondDetailsViewModel>;
  setCoupon(request: SetCouponRequest): Promise<number>;
  getCouponDetails(
    request: GetCouponDetailsRequest,
  ): Promise<CouponDetailsViewModel>;
  getCouponFor(request: GetCouponForRequest): Promise<CouponForViewModel>;
  getCoupon(request: GetCouponRequest): Promise<CouponViewModel>;
  getAllCoupons(request: GetAllCouponsRequest): Promise<CouponViewModel[]>;
}

class BondInPort implements IBondInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly networkService: NetworkService = Injectable.resolve(
      NetworkService,
    ),
  ) {}

  @LogError
  async create(
    req: CreateBondRequest,
  ): Promise<{ security: SecurityViewModel }> {
    handleValidation('CreateBondRequest', req);
    const { diamondOwnerAccount } = req;

    const securityFactory = this.networkService.configuration.factoryAddress;
    const resolver = this.networkService.configuration.resolverAddress;
    const businessLogicKeysCommon =
      this.networkService.configuration.businessLogicKeysCommon;
    const businessLogicKeysBond =
      this.networkService.configuration.businessLogicKeysBond;
    const businessLogicKeys = businessLogicKeysCommon.concat(
      businessLogicKeysBond,
    );

    const newSecurity: SecurityProps = {
      name: req.name,
      symbol: req.symbol,
      isin: req.isin,
      decimals: req.decimals,
      isWhiteList: req.isWhiteList,
      isControllable: req.isControllable,
      isMultiPartition: req.isMultiPartition,
      maxSupply: BigDecimal.fromString(req.numberOfUnits),
      regulationType: CastRegulationType.fromNumber(req.regulationType),
      regulationsubType: CastRegulationSubType.fromNumber(
        req.regulationSubType,
      ),
      isCountryControlListWhiteList: req.isCountryControlListWhiteList,
      countries: req.countries,
      info: req.info,
    };

    const createResponse = await this.commandBus.execute(
      new CreateBondCommand(
        newSecurity,
        req.currency,
        req.nominalValue,
        req.startingDate,
        req.maturityDate,
        req.couponFrequency,
        req.couponRate,
        req.firstCouponDate,
        securityFactory ? new ContractId(securityFactory) : undefined,
        resolver ? new ContractId(resolver) : undefined,
        businessLogicKeys ? businessLogicKeys : [],
        diamondOwnerAccount,
      ),
    );

    const securityCreated =
      createResponse.securityId.toString() !== ContractId.NULL.toString();

    const res = securityCreated
      ? (
          await this.queryBus.execute(
            new GetSecurityQuery(createResponse.securityId.toString()),
          )
        ).security
      : {};

    return {
      security: securityCreated
        ? {
            ...res,
          }
        : {},
    };
  }

  @LogError
  async getBondDetails(
    request: GetBondDetailsRequest,
  ): Promise<BondDetailsViewModel> {
    handleValidation('GetBondDetailsRequest', request);

    const res = await this.queryBus.execute(
      new GetBondDetailsQuery(request.bondId),
    );

    const bondDetails: BondDetailsViewModel = {
      currency: res.bond.currency,
      nominalValue: res.bond.nominalValue.toString(),
      startingDate: new Date(res.bond.startingDate * ONE_THOUSAND),
      maturityDate: new Date(res.bond.maturityDate * ONE_THOUSAND),
    };

    return bondDetails;
  }

  @LogError
  async setCoupon(request: SetCouponRequest): Promise<number> {
    const { rate, recordTimestamp, executionTimestamp, securityId } = request;
    handleValidation('SetCouponRequest', request);

    return (
      await this.commandBus.execute(
        new SetCouponCommand(
          securityId,
          recordTimestamp,
          executionTimestamp,
          rate,
        ),
      )
    ).payload;
  }

  @LogError
  async getCouponDetails(
    request: GetCouponDetailsRequest,
  ): Promise<CouponDetailsViewModel> {
    handleValidation('GetCouponDetailsRequest', request);

    const res = await this.queryBus.execute(
      new GetCouponDetailsQuery(request.bondId),
    );

    const couponDetails: CouponDetailsViewModel = {
      couponFrequency: res.coupon.couponFrequency,
      couponRate: res.coupon.couponRate.toString(),
      firstCouponDate: new Date(res.coupon.firstCouponDate * ONE_THOUSAND),
    };
    return couponDetails;
  }

  @LogError
  async getCouponFor(
    request: GetCouponForRequest,
  ): Promise<CouponForViewModel> {
    handleValidation('GetCouponForRequest', request);

    const res = await this.queryBus.execute(
      new GetCouponForQuery(
        request.targetId,
        request.securityId,
        request.couponId,
      ),
    );

    const couponFor: CouponForViewModel = {
      value: res.payload.toString(),
    };

    return couponFor;
  }

  @LogError
  async getCoupon(request: GetCouponRequest): Promise<CouponViewModel> {
    handleValidation('GetCouponRequest', request);

    const res = await this.queryBus.execute(
      new GetCouponQuery(request.securityId, request.couponId),
    );

    const coupon: CouponViewModel = {
      couponId: request.couponId,
      recordDate: new Date(res.coupon.recordTimeStamp * ONE_THOUSAND),
      executionDate: new Date(res.coupon.executionTimeStamp * ONE_THOUSAND),
      rate: res.coupon.rate.toString(),
    };

    return coupon;
  }

  @LogError
  async getAllCoupons(
    request: GetAllCouponsRequest,
  ): Promise<CouponViewModel[]> {
    handleValidation('GetAllCouponRequest', request);

    const count = await this.queryBus.execute(
      new GetCouponCountQuery(request.securityId),
    );

    if (count.payload == 0) return [];

    const coupons: CouponViewModel[] = [];

    for (let i = 1; i <= count.payload; i++) {
      const couponRequest = new GetCouponRequest({
        securityId: request.securityId,
        couponId: i,
      });

      const coupon = await this.getCoupon(couponRequest);

      coupons.push(coupon);
    }

    return coupons;
  }
}

const BondToken = new BondInPort();
export default BondToken;
