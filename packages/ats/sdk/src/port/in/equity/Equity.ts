// SPDX-License-Identifier: Apache-2.0

import { SetDividendsCommand } from "@command/equity/dividends/set/SetDividendsCommand";
import { GetDividendsQuery } from "@query/equity/dividends/getDividends/GetDividendsQuery";
import { GetDividendsCountQuery } from "@query/equity/dividends/getDividendsCount/GetDividendsCountQuery";
import { GetDividendsForQuery } from "@query/equity/dividends/getDividendsFor/GetDividendsForQuery";
import { GetDividendAmountForQuery } from "@query/equity/dividends/getDividendAmountFor/GetDividendAmountForQuery";
import { SetVotingRightsCommand } from "@command/equity/votingRights/set/SetVotingRightsCommand";
import { GetVotingQuery } from "@query/equity/votingRights/getVoting/GetVotingQuery";
import { GetVotingCountQuery } from "@query/equity/votingRights/getVotingCount/GetVotingCountQuery";
import { GetVotingForQuery } from "@query/equity/votingRights/getVotingFor/GetVotingForQuery";
import { SetScheduledBalanceAdjustmentCommand } from "@command/equity/balanceAdjustments/setScheduledBalanceAdjustment/SetScheduledBalanceAdjustmentCommand";
import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import { LogError } from "@core/decorator/LogErrorDecorator";
import { QueryBus } from "@core/query/QueryBus";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import GetDividendsForRequest from "../request/equity/GetDividendsForRequest";
import GetDividendsRequest from "../request/equity/GetDividendsRequest";
import GetAllDividendsRequest from "../request/equity/GetAllDividendsRequest";
import SetDividendsRequest from "../request/equity/SetDividendsRequest";
import DividendsForViewModel from "../response/DividendsForViewModel";
import DividendsViewModel from "../response/DividendsViewModel";
import SetVotingRightsRequest from "../request/equity/SetVotingRightsRequest";
import GetVotingRightsForRequest from "../request/equity/GetVotingRightsForRequest";
import GetVotingRightsRequest from "../request/equity/GetVotingRightsRequest";
import GetAllVotingRightsRequest from "../request/equity/GetAllVotingRightsRequest";
import VotingRightsForViewModel from "../response/VotingRightsForViewModel";
import VotingRightsViewModel from "../response/VotingRightsViewModel";
import CreateEquityRequest from "../request/equity/CreateEquityRequest";
import { SecurityViewModel } from "../security/Security";
import NetworkService from "@service/network/NetworkService";
import { SecurityProps } from "@domain/context/security/Security";
import { CreateEquityCommand } from "@command/equity/create/CreateEquityCommand";
import ContractId from "@domain/context/contract/ContractId";
import { GetSecurityQuery } from "@query/security/get/GetSecurityQuery";
import { CastDividendType } from "@domain/context/equity/DividendType";
import BigDecimal from "@domain/context/shared/BigDecimal";
import GetEquityDetailsRequest from "../request/equity/GetEquityDetailsRequest";
import EquityDetailsViewModel from "../response/EquityDetailsViewModel";
import { GetEquityDetailsQuery } from "@query/equity/get/getEquityDetails/GetEquityDetailsQuery";
import { CastRegulationSubType, CastRegulationType } from "@domain/context/factory/RegulationType";
import SetScheduledBalanceAdjustmentRequest from "../request/equity/SetScheduledBalanceAdjustmentRequest";
import GetScheduledBalanceAdjustmentRequest from "../request/equity/GetScheduledBalanceAdjustmentRequest";
import ScheduledBalanceAdjustmentViewModel from "../response/ScheduledBalanceAdjustmentViewModel";
import { GetScheduledBalanceAdjustmentQuery } from "@query/equity/balanceAdjustments/getScheduledBalanceAdjustment/GetScheduledBalanceAdjustmentQuery";
import GetScheduledBalanceAdjustmentCountRequest from "../request/equity/GetScheduledBalanceAdjustmentsCountRequest";
import { GetScheduledBalanceAdjustmentCountQuery } from "@query/equity/balanceAdjustments/getScheduledBalanceAdjustmentCount/GetScheduledBalanceAdjustmentsCountQuery";
import { GetDividendHoldersQuery } from "@query/equity/dividends/getDividendHolders/GetDividendHoldersQuery";
import { GetTotalDividendHoldersQuery } from "@query/equity/dividends/getTotalDividendHolders/GetTotalDividendHoldersQuery";
import { GetVotingHoldersQuery } from "@query/equity/votingRights/getVotingHolders/GetVotingHoldersQuery";
import { GetTotalVotingHoldersQuery } from "@query/equity/votingRights/getTotalVotingHolders/GetTotalVotingHoldersQuery";
import GetAllScheduledBalanceAdjustmentsRequest from "../request/equity/GetAllScheduledBalanceAdjustmentst";
import GetDividendHoldersRequest from "../request/equity/GetDividendHoldersRequest";
import GetTotalDividendHoldersRequest from "../request/equity/GetTotalDividendHoldersRequest";
import GetVotingHoldersRequest from "../request/equity/GetVotingHoldersRequest";
import GetTotalVotingHoldersRequest from "../request/equity/GetTotalVotingHoldersRequest";
import CreateTrexSuiteEquityRequest from "../request/equity/CreateTrexSuiteEquityRequest";
import { CreateTrexSuiteEquityCommand } from "@command/equity/createTrexSuite/CreateTrexSuiteEquityCommand";
import DividendAmountForViewModel from "../response/DividendAmountForViewModel";

interface IEquityInPort {
  create(request: CreateEquityRequest): Promise<{
    security: SecurityViewModel;
    transactionId: string;
  }>;
  getEquityDetails(request: GetEquityDetailsRequest): Promise<EquityDetailsViewModel>;
  setDividends(request: SetDividendsRequest): Promise<{ payload: number; transactionId: string }>;
  getDividendsFor(request: GetDividendsForRequest): Promise<DividendsForViewModel>;
  getDividendAmountFor(request: GetDividendsForRequest): Promise<DividendAmountForViewModel>;
  getDividends(request: GetDividendsRequest): Promise<DividendsViewModel>;
  getAllDividends(request: GetAllDividendsRequest): Promise<DividendsViewModel[]>;
  setVotingRights(request: SetVotingRightsRequest): Promise<{ payload: number; transactionId: string }>;
  getVotingRightsFor(request: GetVotingRightsForRequest): Promise<VotingRightsForViewModel>;
  getVotingRights(request: GetVotingRightsRequest): Promise<VotingRightsViewModel>;
  getAllVotingRights(request: GetAllVotingRightsRequest): Promise<VotingRightsViewModel[]>;
  setScheduledBalanceAdjustment(
    request: SetScheduledBalanceAdjustmentRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  getScheduledBalanceAdjustmentsCount(request: GetScheduledBalanceAdjustmentCountRequest): Promise<number>;
  getScheduledBalanceAdjustment(
    request: GetScheduledBalanceAdjustmentRequest,
  ): Promise<ScheduledBalanceAdjustmentViewModel>;
  getAllScheduledBalanceAdjustments(
    request: GetAllScheduledBalanceAdjustmentsRequest,
  ): Promise<ScheduledBalanceAdjustmentViewModel[]>;
  getDividendHolders(request: GetDividendHoldersRequest): Promise<string[]>;
  getTotalDividendHolders(request: GetTotalDividendHoldersRequest): Promise<number>;
  getVotingHolders(request: GetVotingHoldersRequest): Promise<string[]>;
  getTotalVotingHolders(request: GetTotalVotingHoldersRequest): Promise<number>;

  createTrexSuite(request: CreateTrexSuiteEquityRequest): Promise<{
    security: SecurityViewModel;
    transactionId: string;
  }>;
}

class EquityInPort implements IEquityInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly networkService: NetworkService = Injectable.resolve(NetworkService),
  ) {}
  @LogError
  async createTrexSuite(req: CreateTrexSuiteEquityRequest): Promise<{
    security: SecurityViewModel;
    transactionId: string;
  }> {
    ValidatedRequest.handleValidation("CreateTrexSuiteEquityRequest", req);
    const { diamondOwnerAccount, externalPauses, externalControlLists, externalKycLists } = req;

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
      maxSupply: BigDecimal.fromString(req.numberOfShares),
      regulationType: CastRegulationType.fromNumber(req.regulationType),
      regulationsubType: CastRegulationSubType.fromNumber(req.regulationSubType),
      isCountryControlListWhiteList: req.isCountryControlListWhiteList,
      countries: req.countries,
      info: req.info,
      erc20VotesActivated: req.erc20VotesActivated,
    };

    const createResponse = await this.commandBus.execute(
      new CreateTrexSuiteEquityCommand(
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
        req.votingRight,
        req.informationRight,
        req.liquidationRight,
        req.subscriptionRight,
        req.conversionRight,
        req.redemptionRight,
        req.putRight,
        CastDividendType.fromNumber(req.dividendRight),
        req.currency,
        req.nominalValue,
        req.nominalValueDecimals,
        new ContractId(securityFactory),
        new ContractId(resolver),
        req.configId,
        req.configVersion,
        diamondOwnerAccount,
        externalPauses,
        externalControlLists,
        externalKycLists,
        req.complianceId,
        req.identityRegistryId,
      ),
    );

    const securityCreated = createResponse.securityId.toString() !== ContractId.NULL.toString();

    const res = securityCreated
      ? (await this.queryBus.execute(new GetSecurityQuery(createResponse.securityId.toString()))).security
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
  async create(req: CreateEquityRequest): Promise<{ security: SecurityViewModel; transactionId: string }> {
    ValidatedRequest.handleValidation("CreateEquityRequest", req);
    const { diamondOwnerAccount, externalPausesIds, externalControlListsIds, externalKycListsIds } = req;

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
      maxSupply: BigDecimal.fromString(req.numberOfShares),
      regulationType: CastRegulationType.fromNumber(req.regulationType),
      regulationsubType: CastRegulationSubType.fromNumber(req.regulationSubType),
      isCountryControlListWhiteList: req.isCountryControlListWhiteList,
      countries: req.countries,
      info: req.info,
    };

    const createResponse = await this.commandBus.execute(
      new CreateEquityCommand(
        newSecurity,
        req.votingRight,
        req.informationRight,
        req.liquidationRight,
        req.subscriptionRight,
        req.conversionRight,
        req.redemptionRight,
        req.putRight,
        CastDividendType.fromNumber(req.dividendRight),
        req.currency,
        req.nominalValue,
        req.nominalValueDecimals,
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
      ),
    );

    const securityCreated = createResponse.securityId.toString() !== ContractId.NULL.toString();

    const res = securityCreated
      ? (await this.queryBus.execute(new GetSecurityQuery(createResponse.securityId.toString()))).security
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
  async getEquityDetails(request: GetEquityDetailsRequest): Promise<EquityDetailsViewModel> {
    ValidatedRequest.handleValidation("GetEquityDetailsRequest", request);

    const res = await this.queryBus.execute(new GetEquityDetailsQuery(request.equityId));

    const equityDetails: EquityDetailsViewModel = {
      votingRight: res.equity.votingRight,
      informationRight: res.equity.informationRight,
      liquidationRight: res.equity.liquidationRight,
      subscriptionRight: res.equity.subscriptionRight,
      conversionRight: res.equity.conversionRight,
      redemptionRight: res.equity.redemptionRight,
      putRight: res.equity.putRight,
      dividendRight: CastDividendType.toNumber(res.equity.dividendRight),
      currency: res.equity.currency,
      nominalValue: res.equity.nominalValue.toString(),
      nominalValueDecimals: res.equity.nominalValueDecimals,
    };

    return equityDetails;
  }

  @LogError
  async setVotingRights(request: SetVotingRightsRequest): Promise<{ payload: number; transactionId: string }> {
    const { recordTimestamp, securityId, data } = request;
    ValidatedRequest.handleValidation("SetVotingRightsRequest", request);

    return await this.commandBus.execute(new SetVotingRightsCommand(securityId, recordTimestamp, data));
  }

  @LogError
  async getVotingRightsFor(request: GetVotingRightsForRequest): Promise<VotingRightsForViewModel> {
    ValidatedRequest.handleValidation("GetVotingRightsForRequest", request);

    const res = await this.queryBus.execute(
      new GetVotingForQuery(request.targetId, request.securityId, request.votingId),
    );

    const votingFor: VotingRightsForViewModel = {
      tokenBalance: res.tokenBalance.toString(),
      decimals: res.decimals.toString(),
    };

    return votingFor;
  }

  @LogError
  async getVotingRights(request: GetVotingRightsRequest): Promise<VotingRightsViewModel> {
    ValidatedRequest.handleValidation("GetVotingRightsRequest", request);

    const res = await this.queryBus.execute(new GetVotingQuery(request.securityId, request.votingId));

    const votingRight: VotingRightsViewModel = {
      votingId: request.votingId,
      recordDate: new Date(res.voting.recordTimeStamp * ONE_THOUSAND),
      data: res.voting.data,
    };

    return votingRight;
  }

  @LogError
  async getAllVotingRights(request: GetAllVotingRightsRequest): Promise<VotingRightsViewModel[]> {
    ValidatedRequest.handleValidation("GetAllVotingRightsRequest", request);

    const count = await this.queryBus.execute(new GetVotingCountQuery(request.securityId));

    if (count.payload == 0) return [];

    const votingRights: VotingRightsViewModel[] = [];

    for (let i = 1; i <= count.payload; i++) {
      const res = await this.queryBus.execute(new GetVotingQuery(request.securityId, i));

      const votingright: VotingRightsViewModel = {
        votingId: i,
        recordDate: new Date(res.voting.recordTimeStamp * ONE_THOUSAND),
        data: res.voting.data,
      };

      votingRights.push(votingright);
    }

    return votingRights;
  }

  @LogError
  async setDividends(request: SetDividendsRequest): Promise<{ payload: number; transactionId: string }> {
    const { amountPerUnitOfSecurity, recordTimestamp, executionTimestamp, securityId } = request;
    ValidatedRequest.handleValidation("SetDividendsRequest", request);

    return await this.commandBus.execute(
      new SetDividendsCommand(securityId, recordTimestamp, executionTimestamp, amountPerUnitOfSecurity),
    );
  }

  @LogError
  async getDividendsFor(request: GetDividendsForRequest): Promise<DividendsForViewModel> {
    ValidatedRequest.handleValidation("GetDividendsForRequest", request);

    const res = await this.queryBus.execute(
      new GetDividendsForQuery(request.targetId, request.securityId, request.dividendId),
    );

    const dividendsFor: DividendsForViewModel = {
      tokenBalance: res.tokenBalance.toString(),
      decimals: res.decimals.toString(),
    };

    return dividendsFor;
  }

  @LogError
  async getDividendAmountFor(request: GetDividendsForRequest): Promise<DividendAmountForViewModel> {
    ValidatedRequest.handleValidation("GetDividendForRequest", request);

    const res = await this.queryBus.execute(
      new GetDividendAmountForQuery(request.targetId, request.securityId, request.dividendId),
    );

    const dividendAmountFor: DividendAmountForViewModel = {
      numerator: res.numerator,
      denominator: res.denominator,
      recordDateReached: res.recordDateReached,
    };

    return dividendAmountFor;
  }

  @LogError
  async getDividends(request: GetDividendsRequest): Promise<DividendsViewModel> {
    ValidatedRequest.handleValidation("GetDividendsRequest", request);

    const res = await this.queryBus.execute(new GetDividendsQuery(request.securityId, request.dividendId));

    const dividend: DividendsViewModel = {
      dividendId: request.dividendId,
      amountPerUnitOfSecurity: res.dividend.amountPerUnitOfSecurity.toString(),
      amountDecimals: res.dividend.amountDecimals,
      recordDate: new Date(res.dividend.recordTimeStamp * ONE_THOUSAND),
      executionDate: new Date(res.dividend.executionTimeStamp * ONE_THOUSAND),
    };

    return dividend;
  }

  @LogError
  async getAllDividends(request: GetAllDividendsRequest): Promise<DividendsViewModel[]> {
    ValidatedRequest.handleValidation("GetAllDividendsRequest", request);

    const count = await this.queryBus.execute(new GetDividendsCountQuery(request.securityId));

    if (count.payload == 0) return [];

    const dividends: DividendsViewModel[] = [];

    for (let i = 1; i <= count.payload; i++) {
      const res = await this.queryBus.execute(new GetDividendsQuery(request.securityId, i));

      const dividend: DividendsViewModel = {
        dividendId: i,
        amountPerUnitOfSecurity: res.dividend.amountPerUnitOfSecurity.toString(),
        amountDecimals: res.dividend.amountDecimals,
        recordDate: new Date(res.dividend.recordTimeStamp * ONE_THOUSAND),
        executionDate: new Date(res.dividend.executionTimeStamp * ONE_THOUSAND),
      };

      dividends.push(dividend);
    }

    return dividends;
  }

  @LogError
  async setScheduledBalanceAdjustment(
    request: SetScheduledBalanceAdjustmentRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    const { executionDate, factor, decimals, securityId } = request;
    ValidatedRequest.handleValidation("SetScheduledBalanceAdjustmentRequest", request);

    return await this.commandBus.execute(
      new SetScheduledBalanceAdjustmentCommand(securityId, executionDate, factor, decimals),
    );
  }

  @LogError
  async getScheduledBalanceAdjustment(
    request: GetScheduledBalanceAdjustmentRequest,
  ): Promise<ScheduledBalanceAdjustmentViewModel> {
    ValidatedRequest.handleValidation("GetScheduledBalanceAdjustmentRequest", request);

    const res = await this.queryBus.execute(
      new GetScheduledBalanceAdjustmentQuery(request.securityId, request.balanceAdjustmentId),
    );

    const scheduledBalanceAdjustment: ScheduledBalanceAdjustmentViewModel = {
      id: request.balanceAdjustmentId,
      executionDate: new Date(res.scheduleBalanceAdjustment.executionTimeStamp * ONE_THOUSAND),
      factor: res.scheduleBalanceAdjustment.factor.toString(),
      decimals: res.scheduleBalanceAdjustment.decimals.toString(),
    };

    return scheduledBalanceAdjustment;
  }

  @LogError
  async getScheduledBalanceAdjustmentsCount(request: GetScheduledBalanceAdjustmentCountRequest): Promise<number> {
    const { securityId } = request;
    ValidatedRequest.handleValidation("GetScheduledBalanceAdjustmentCountRequest", request);

    const getScheduledBalanceAdjustmentCountQueryResponse = await this.queryBus.execute(
      new GetScheduledBalanceAdjustmentCountQuery(securityId),
    );

    return getScheduledBalanceAdjustmentCountQueryResponse.payload;
  }

  @LogError
  async getAllScheduledBalanceAdjustments(
    request: GetAllScheduledBalanceAdjustmentsRequest,
  ): Promise<ScheduledBalanceAdjustmentViewModel[]> {
    ValidatedRequest.handleValidation("GetAllScheduledBalanceAdjustmentsRequest", request);

    const count = await this.queryBus.execute(new GetScheduledBalanceAdjustmentCountQuery(request.securityId));

    if (count.payload == 0) return [];

    const scheduledBalanceAdjustments: ScheduledBalanceAdjustmentViewModel[] = [];

    for (let i = 1; i <= count.payload; i++) {
      const res = await this.queryBus.execute(new GetScheduledBalanceAdjustmentQuery(request.securityId, i));

      const scheduledBalanceAdjustment: ScheduledBalanceAdjustmentViewModel = {
        id: i,
        executionDate: new Date(res.scheduleBalanceAdjustment.executionTimeStamp * ONE_THOUSAND),
        factor: res.scheduleBalanceAdjustment.factor.toString(),
        decimals: res.scheduleBalanceAdjustment.decimals.toString(),
      };

      scheduledBalanceAdjustments.push(scheduledBalanceAdjustment);
    }

    return scheduledBalanceAdjustments;
  }

  @LogError
  async getDividendHolders(request: GetDividendHoldersRequest): Promise<string[]> {
    const { securityId, dividendId, start, end } = request;
    ValidatedRequest.handleValidation(GetDividendHoldersRequest.name, request);

    return (await this.queryBus.execute(new GetDividendHoldersQuery(securityId, dividendId, start, end))).payload;
  }

  @LogError
  async getTotalDividendHolders(request: GetTotalDividendHoldersRequest): Promise<number> {
    const { securityId, dividendId } = request;
    ValidatedRequest.handleValidation(GetTotalDividendHoldersRequest.name, request);

    return (await this.queryBus.execute(new GetTotalDividendHoldersQuery(securityId, dividendId))).payload;
  }

  @LogError
  async getVotingHolders(request: GetVotingHoldersRequest): Promise<string[]> {
    const { securityId, voteId, start, end } = request;
    ValidatedRequest.handleValidation(GetVotingHoldersRequest.name, request);

    return (await this.queryBus.execute(new GetVotingHoldersQuery(securityId, voteId, start, end))).payload;
  }

  @LogError
  async getTotalVotingHolders(request: GetTotalVotingHoldersRequest): Promise<number> {
    const { securityId, voteId } = request;
    ValidatedRequest.handleValidation(GetTotalVotingHoldersRequest.name, request);

    return (await this.queryBus.execute(new GetTotalVotingHoldersQuery(securityId, voteId))).payload;
  }
}

const EquityToken = new EquityInPort();
export default EquityToken;
