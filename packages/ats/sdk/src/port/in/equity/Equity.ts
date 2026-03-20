// SPDX-License-Identifier: Apache-2.0

import { SetVotingRightsCommand } from "@command/equity/votingRights/set/SetVotingRightsCommand";
import { CancelVotingCommand } from "@command/equity/votingRights/cancel/CancelVotingCommand";
import { GetVotingQuery } from "@query/equity/votingRights/getVoting/GetVotingQuery";
import { GetVotingCountQuery } from "@query/equity/votingRights/getVotingCount/GetVotingCountQuery";
import { GetVotingForQuery } from "@query/equity/votingRights/getVotingFor/GetVotingForQuery";
import { CancelScheduledBalanceAdjustmentCommand } from "@command/equity/balanceAdjustments/cancelScheduledBalanceAdjustment/CancelScheduledBalanceAdjustmentCommand";
import { SetScheduledBalanceAdjustmentCommand } from "@command/equity/balanceAdjustments/setScheduledBalanceAdjustment/SetScheduledBalanceAdjustmentCommand";
import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import { LogError } from "@core/decorator/LogErrorDecorator";
import { QueryBus } from "@core/query/QueryBus";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";
import ValidatedRequest from "@core/validation/ValidatedArgs";
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
import CancelScheduledBalanceAdjustmentRequest from "../request/equity/CancelScheduledBalanceAdjustmentRequest";
import SetScheduledBalanceAdjustmentRequest from "../request/equity/SetScheduledBalanceAdjustmentRequest";
import GetScheduledBalanceAdjustmentRequest from "../request/equity/GetScheduledBalanceAdjustmentRequest";
import ScheduledBalanceAdjustmentViewModel from "../response/ScheduledBalanceAdjustmentViewModel";
import { GetScheduledBalanceAdjustmentQuery } from "@query/equity/balanceAdjustments/getScheduledBalanceAdjustment/GetScheduledBalanceAdjustmentQuery";
import GetScheduledBalanceAdjustmentCountRequest from "../request/equity/GetScheduledBalanceAdjustmentsCountRequest";
import { GetScheduledBalanceAdjustmentCountQuery } from "@query/equity/balanceAdjustments/getScheduledBalanceAdjustmentCount/GetScheduledBalanceAdjustmentsCountQuery";
import { GetVotingHoldersQuery } from "@query/equity/votingRights/getVotingHolders/GetVotingHoldersQuery";
import { GetTotalVotingHoldersQuery } from "@query/equity/votingRights/getTotalVotingHolders/GetTotalVotingHoldersQuery";
import GetAllScheduledBalanceAdjustmentsRequest from "../request/equity/GetAllScheduledBalanceAdjustmentst";
import GetVotingHoldersRequest from "../request/equity/GetVotingHoldersRequest";
import GetTotalVotingHoldersRequest from "../request/equity/GetTotalVotingHoldersRequest";
import CreateTrexSuiteEquityRequest from "../request/equity/CreateTrexSuiteEquityRequest";
import { CreateTrexSuiteEquityCommand } from "@command/equity/createTrexSuite/CreateTrexSuiteEquityCommand";
import CancelVotingRequest from "../request/equity/CancelVotingRequest";

interface IEquityInPort {
  create(request: CreateEquityRequest): Promise<{
    security: SecurityViewModel;
    transactionId: string;
  }>;
  getEquityDetails(request: GetEquityDetailsRequest): Promise<EquityDetailsViewModel>;
  setVotingRights(request: SetVotingRightsRequest): Promise<{ payload: number; transactionId: string }>;
  cancelVoting(request: CancelVotingRequest): Promise<{ payload: boolean; transactionId: string }>;
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
  getVotingHolders(request: GetVotingHoldersRequest): Promise<string[]>;
  getTotalVotingHolders(request: GetTotalVotingHoldersRequest): Promise<number>;
  createTrexSuite(request: CreateTrexSuiteEquityRequest): Promise<{
    security: SecurityViewModel;
    transactionId: string;
  }>;
  cancelScheduledBalanceAdjustment(request: CancelScheduledBalanceAdjustmentRequest): Promise<{
    payload: boolean;
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
  async cancelVoting(request: CancelVotingRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, votingId } = request;
    ValidatedRequest.handleValidation("CancelVotingRequest", request);

    return await this.commandBus.execute(new CancelVotingCommand(securityId, votingId));
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
      isDisabled: res.isDisabled,
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
      isDisabled: res.voting.isDisabled,
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
        isDisabled: res.voting.isDisabled,
      };

      votingRights.push(votingright);
    }

    return votingRights;
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
      isDisabled: res.scheduleBalanceAdjustment.isDisabled,
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
        isDisabled: res.scheduleBalanceAdjustment.isDisabled,
      };

      scheduledBalanceAdjustments.push(scheduledBalanceAdjustment);
    }

    return scheduledBalanceAdjustments;
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

  @LogError
  async cancelScheduledBalanceAdjustment(request: CancelScheduledBalanceAdjustmentRequest): Promise<{
    payload: boolean;
    transactionId: string;
  }> {
    const { securityId, balanceAdjustmentId } = request;
    ValidatedRequest.handleValidation("CancelScheduledBalanceAdjustmentRequest", request);

    return await this.commandBus.execute(new CancelScheduledBalanceAdjustmentCommand(securityId, balanceAdjustmentId));
  }
}

const EquityToken = new EquityInPort();
export default EquityToken;
