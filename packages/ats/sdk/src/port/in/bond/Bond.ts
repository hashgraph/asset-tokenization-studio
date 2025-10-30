// SPDX-License-Identifier: Apache-2.0

import { GetBondDetailsQuery } from '@query/bond/get/getBondDetails/GetBondDetailsQuery';
import Injectable from '@core/injectable/Injectable';
import { LogError } from '@core/decorator/LogErrorDecorator';
import { QueryBus } from '@core/query/QueryBus';
import ValidatedRequest from '@core/validation/ValidatedArgs';

import GetBondDetailsRequest from '../request/bond/GetBondDetailsRequest';
import BondDetailsViewModel from '../response/BondDetailsViewModel';
import CouponViewModel from '../response/CouponViewModel';
import CouponForViewModel from '../response/CouponForViewModel';
import GetAllCouponsRequest from '../request/bond/GetAllCouponsRequest';
import GetCouponForRequest from '../request/bond/GetCouponForRequest';
import GetCouponRequest from '../request/bond/GetCouponRequest';
import { GetCouponForQuery } from '@query/bond/coupons/getCouponFor/GetCouponForQuery';
import { GetCouponQuery } from '@query/bond/coupons/getCoupon/GetCouponQuery';
import { GetCouponCountQuery } from '@query/bond/coupons/getCouponCount/GetCouponCountQuery';
import { ONE_THOUSAND } from '@domain/context/shared/SecurityDate';
import CreateBondRequest from '../request/bond/CreateBondRequest';
import { SecurityViewModel } from '../security/Security';
import { CommandBus } from '@core/command/CommandBus';
import NetworkService from '@service/network/NetworkService';
import { SecurityProps } from '@domain/context/security/Security';
import { CreateBondCommand } from '@command/bond/create/CreateBondCommand';
import ContractId from '@domain/context/contract/ContractId';
import { GetSecurityQuery } from '@query/security/get/GetSecurityQuery';
import BigDecimal from '@domain/context/shared/BigDecimal';
import SetCouponRequest from '../request/bond/SetCouponRequest';
import { SetCouponCommand } from '@command/bond/coupon/set/SetCouponCommand';
import {
  CastRegulationSubType,
  CastRegulationType,
} from '@domain/context/factory/RegulationType';
import UpdateMaturityDateRequest from '../request/bond/UpdateMaturityDateRequest';
import { UpdateMaturityDateCommand } from '@command/bond/updateMaturityDate/UpdateMaturityDateCommand';
import { RedeemAtMaturityByPartitionCommand } from '@command/bond/redeemAtMaturityByPartition/RedeemAtMaturityByPartitionCommand';
import RedeemAtMaturityByPartitionRequest from '../request/bond/RedeemAtMaturityByPartitionRequest';

import { GetCouponHoldersQuery } from '@query/bond/coupons/getCouponHolders/GetCouponHoldersQuery';
import { GetTotalCouponHoldersQuery } from '@query/bond/coupons/getTotalCouponHolders/GetTotalCouponHoldersQuery';
import CreateTrexSuiteBondRequest from '../request/bond/CreateTrexSuiteBondRequest';
import { CreateTrexSuiteBondCommand } from '@command/bond/createTrexSuite/CreateTrexSuiteBondCommand';
import AddProceedRecipientRequest from '../request/bond/AddProceedRecipientRequest';
import RemoveProceedRecipientRequest from '../request/bond/RemoveProceedRecipientRequest';
import UpdateProceedRecipientDataRequest from '../request/bond/UpdateProceedRecipientDataRequest';
import { UpdateProceedRecipientDataCommand } from '@command/security/proceedRecipients/updateProceedRecipientData/UpdateProceedRecipientDataCommand';
import { RemoveProceedRecipientCommand } from '@command/security/proceedRecipients/removeProceedRecipient/RemoveProceedRecipientCommand';
import { AddProceedRecipientCommand } from '@command/security/proceedRecipients/addProceedRecipient/AddProceedRecipientCommand';
import IsProceedRecipientRequest from '../request/bond/IsProceedRecipientRequest';
import { GetProceedRecipientsQuery } from '@query/security/proceedRecipient/getProceedRecipients/GetProceedRecipientsQuery';
import { GetProceedRecipientsCountQuery } from '@query/security/proceedRecipient/getProceedRecipientsCount/GetProceedRecipientsCountQuery';
import { GetProceedRecipientDataQuery } from '@query/security/proceedRecipient/getProceedRecipientData/GetProceedRecipientDataQuery';
import { IsProceedRecipientQuery } from '@query/security/proceedRecipient/isProceedRecipient/IsProceedRecipientQuery';
import {
  GetCouponHoldersRequest,
  GetTotalCouponHoldersRequest,
  GetProceedRecipientDataRequest,
  GetProceedRecipientsCountRequest,
  GetProceedRecipientsRequest,
} from '../request';

interface IBondInPort {
  create(
    request: CreateBondRequest,
  ): Promise<{ security: SecurityViewModel; transactionId: string }>;
  getBondDetails(request: GetBondDetailsRequest): Promise<BondDetailsViewModel>;
  setCoupon(
    request: SetCouponRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  getCouponFor(request: GetCouponForRequest): Promise<CouponForViewModel>;
  getCoupon(request: GetCouponRequest): Promise<CouponViewModel>;
  getAllCoupons(request: GetAllCouponsRequest): Promise<CouponViewModel[]>;
  updateMaturityDate(
    request: UpdateMaturityDateRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  redeemAtMaturityByPartition(
    request: RedeemAtMaturityByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  getCouponHolders(request: GetCouponHoldersRequest): Promise<string[]>;
  getTotalCouponHolders(request: GetTotalCouponHoldersRequest): Promise<number>;
  createTrexSuite(
    request: CreateTrexSuiteBondRequest,
  ): Promise<{ security: SecurityViewModel; transactionId: string }>;

  addProceedRecipient(
    request: AddProceedRecipientRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  removeProceedRecipient(
    request: RemoveProceedRecipientRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  updateProceedRecipientData(
    request: UpdateProceedRecipientDataRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  isProceedRecipient(
    request: IsProceedRecipientRequest,
  ): Promise<{ payload: boolean }>;
  getProceedRecipientData(
    request: GetProceedRecipientDataRequest,
  ): Promise<{ payload: string }>;
  getProceedRecipientsCount(
    request: GetProceedRecipientsCountRequest,
  ): Promise<{ payload: number }>;
  getProceedRecipients(
    request: GetProceedRecipientsRequest,
  ): Promise<{ payload: string[] }>;
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
  ): Promise<{ security: SecurityViewModel; transactionId: string }> {
    ValidatedRequest.handleValidation('CreateBondRequest', req);
    const {
      diamondOwnerAccount,
      externalPausesIds,
      externalControlListsIds,
      externalKycListsIds,
    } = req;

    const securityFactory = this.networkService.configuration.factoryAddress;
    const resolver = this.networkService.configuration.resolverAddress;

    const newSecurity: SecurityProps = {
      name: req.name,
      symbol: req.symbol,
      isin: req.isin,
      decimals: req.decimals,
      isWhiteList: req.isWhiteList,
      erc20VotesActivated: req.erc20VotesActivated,
      isControllable: req.isControllable,
      arePartitionsProtected: req.arePartitionsProtected,
      clearingActive: req.clearingActive,
      internalKycActivated: req.internalKycActivated,
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
        securityFactory ? new ContractId(securityFactory) : undefined,
        resolver ? new ContractId(resolver) : undefined,
        req.configId,
        req.configVersion,
        diamondOwnerAccount,
        externalPausesIds,
        externalControlListsIds,
        externalKycListsIds,
        req.complianceId,
        req.identityRegistryId,
        req.proceedRecipientsIds,
        req.proceedRecipientsData,
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
      transactionId: createResponse.transactionId,
    };
  }

  @LogError
  async getBondDetails(
    request: GetBondDetailsRequest,
  ): Promise<BondDetailsViewModel> {
    ValidatedRequest.handleValidation('GetBondDetailsRequest', request);

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
  async setCoupon(
    request: SetCouponRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    const { rate, recordTimestamp, executionTimestamp, securityId, period } =
      request;
    ValidatedRequest.handleValidation('SetCouponRequest', request);

    return await this.commandBus.execute(
      new SetCouponCommand(
        securityId,
        recordTimestamp,
        executionTimestamp,
        rate,
        period,
      ),
    );
  }

  @LogError
  async getCouponFor(
    request: GetCouponForRequest,
  ): Promise<CouponForViewModel> {
    ValidatedRequest.handleValidation('GetCouponForRequest', request);

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
    ValidatedRequest.handleValidation('GetCouponRequest', request);

    const res = await this.queryBus.execute(
      new GetCouponQuery(request.securityId, request.couponId),
    );

    const coupon: CouponViewModel = {
      couponId: request.couponId,
      recordDate: new Date(res.coupon.recordTimeStamp * ONE_THOUSAND),
      executionDate: new Date(res.coupon.executionTimeStamp * ONE_THOUSAND),
      rate: res.coupon.rate.toString(),
      rateDecimals: res.coupon.rateDecimals,
      period: res.coupon.period,
    };

    return coupon;
  }

  @LogError
  async getAllCoupons(
    request: GetAllCouponsRequest,
  ): Promise<CouponViewModel[]> {
    ValidatedRequest.handleValidation('GetAllCouponsRequest', request);

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

  @LogError
  async updateMaturityDate(
    request: UpdateMaturityDateRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { maturityDate, securityId } = request;
    ValidatedRequest.handleValidation('UpdateMaturityDateRequest', request);

    return await this.commandBus.execute(
      new UpdateMaturityDateCommand(maturityDate, securityId),
    );
  }

  @LogError
  async redeemAtMaturityByPartition(
    request: RedeemAtMaturityByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, partitionId, sourceId, amount } = request;
    ValidatedRequest.handleValidation(
      RedeemAtMaturityByPartitionRequest.name,
      request,
    );

    return await this.commandBus.execute(
      new RedeemAtMaturityByPartitionCommand(
        securityId,
        partitionId,
        sourceId,
        amount,
      ),
    );
  }

  @LogError
  async getCouponHolders(request: GetCouponHoldersRequest): Promise<string[]> {
    const { securityId, couponId, start, end } = request;
    ValidatedRequest.handleValidation(GetCouponHoldersRequest.name, request);

    return (
      await this.queryBus.execute(
        new GetCouponHoldersQuery(securityId, couponId, start, end),
      )
    ).payload;
  }

  @LogError
  async getTotalCouponHolders(
    request: GetTotalCouponHoldersRequest,
  ): Promise<number> {
    const { securityId, couponId } = request;
    ValidatedRequest.handleValidation(
      GetTotalCouponHoldersRequest.name,
      request,
    );

    return (
      await this.queryBus.execute(
        new GetTotalCouponHoldersQuery(securityId, couponId),
      )
    ).payload;
  }

  @LogError
  async createTrexSuite(
    req: CreateTrexSuiteBondRequest,
  ): Promise<{ security: SecurityViewModel; transactionId: string }> {
    ValidatedRequest.handleValidation('CreateTrexSuiteBondRequest', req);

    const {
      diamondOwnerAccount,
      externalPauses,
      externalControlLists,
      externalKycLists,
    } = req;

    const securityFactory = this.networkService.configuration.factoryAddress;
    const resolver = this.networkService.configuration.resolverAddress;

    const newSecurity: SecurityProps = {
      name: req.name,
      symbol: req.symbol,
      isin: req.isin,
      decimals: req.decimals,
      isWhiteList: req.isWhiteList,
      isControllable: req.isControllable,
      arePartitionsProtected: req.arePartitionsProtected,
      clearingActive: req.clearingActive,
      internalKycActivated: req.internalKycActivated,
      isMultiPartition: req.isMultiPartition,
      maxSupply: BigDecimal.fromString(req.numberOfUnits),
      regulationType: CastRegulationType.fromNumber(req.regulationType),
      regulationsubType: CastRegulationSubType.fromNumber(
        req.regulationSubType,
      ),
      isCountryControlListWhiteList: req.isCountryControlListWhiteList,
      countries: req.countries,
      info: req.info,
      erc20VotesActivated: req.erc20VotesActivated,
    };

    const createResponse = await this.commandBus.execute(
      new CreateTrexSuiteBondCommand(
        req.salt,
        req.owner,
        req.irs,
        req.onchainId,
        req.irAgents,
        req.tokenAgents,
        req.compliancesModules,
        req.complianceSettings,
        req.claimTopics,
        req.issuers,
        req.issuerClaims,
        newSecurity,
        req.currency,
        req.nominalValue,
        req.startingDate,
        req.maturityDate,
        new ContractId(securityFactory),
        new ContractId(resolver),
        req.configId,
        req.configVersion,
        diamondOwnerAccount,
        req.proceedRecipientsIds,
        req.proceedRecipientsData,
        externalPauses,
        externalControlLists,
        externalKycLists,
        req.complianceId,
        req.identityRegistryId,
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
      transactionId: createResponse.transactionId,
    };
  }

  @LogError
  async updateProceedRecipientData(
    request: UpdateProceedRecipientDataRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation(
      UpdateProceedRecipientDataRequest.name,
      request,
    );
    return await this.commandBus.execute(
      new UpdateProceedRecipientDataCommand(
        request.securityId,
        request.proceedRecipientId,
        request.data,
      ),
    );
  }

  @LogError
  async removeProceedRecipient(
    request: RemoveProceedRecipientRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation(
      RemoveProceedRecipientRequest.name,
      request,
    );
    return await this.commandBus.execute(
      new RemoveProceedRecipientCommand(
        request.securityId,
        request.proceedRecipientId,
      ),
    );
  }

  @LogError
  async addProceedRecipient(
    request: AddProceedRecipientRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation(AddProceedRecipientRequest.name, request);
    return await this.commandBus.execute(
      new AddProceedRecipientCommand(
        request.securityId,
        request.proceedRecipientId,
        request.data,
      ),
    );
  }

  @LogError
  async getProceedRecipients(
    request: GetProceedRecipientsRequest,
  ): Promise<{ payload: string[] }> {
    ValidatedRequest.handleValidation(
      GetProceedRecipientsRequest.name,
      request,
    );
    return await this.queryBus.execute(
      new GetProceedRecipientsQuery(
        request.securityId,
        request.pageIndex,
        request.pageSize,
      ),
    );
  }
  @LogError
  async getProceedRecipientsCount(
    request: GetProceedRecipientsCountRequest,
  ): Promise<{ payload: number }> {
    ValidatedRequest.handleValidation(
      GetProceedRecipientsCountRequest.name,
      request,
    );
    return await this.queryBus.execute(
      new GetProceedRecipientsCountQuery(request.securityId),
    );
  }
  @LogError
  async getProceedRecipientData(
    request: GetProceedRecipientDataRequest,
  ): Promise<{ payload: string }> {
    ValidatedRequest.handleValidation(
      GetProceedRecipientDataRequest.name,
      request,
    );
    return await this.queryBus.execute(
      new GetProceedRecipientDataQuery(
        request.securityId,
        request.proceedRecipientId,
      ),
    );
  }
  @LogError
  async isProceedRecipient(
    request: IsProceedRecipientRequest,
  ): Promise<{ payload: boolean }> {
    ValidatedRequest.handleValidation(IsProceedRecipientRequest.name, request);
    return await this.queryBus.execute(
      new IsProceedRecipientQuery(
        request.securityId,
        request.proceedRecipientId,
      ),
    );
  }
}

const BondToken = new BondInPort();
export default BondToken;
