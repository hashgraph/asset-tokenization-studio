// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import Injectable from "@core/injectable/Injectable";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { GetBondDetailsQuery } from "@query/bond/get/getBondDetails/GetBondDetailsQuery";

import { CreateBondCommand } from "@command/bond/create/CreateBondCommand";
import { CreateBondFixedRateCommand } from "@command/bond/createfixedrate/CreateBondFixedRateCommand";
import { CreateBondKpiLinkedRateCommand } from "@command/bond/createkpilinkedrate/CreateBondKpiLinkedRateCommand";
import { AddKpiDataCommand } from "@command/kpis/addKpiData/AddKpiDataCommand";
import { CreateTrexSuiteBondCommand } from "@command/bond/createTrexSuite/CreateTrexSuiteBondCommand";
import { FullRedeemAtMaturityCommand } from "@command/bond/fullRedeemAtMaturity/FullRedeemAtMaturityCommand";
import { RedeemAtMaturityByPartitionCommand } from "@command/bond/redeemAtMaturityByPartition/RedeemAtMaturityByPartitionCommand";
import { UpdateMaturityDateCommand } from "@command/bond/updateMaturityDate/UpdateMaturityDateCommand";
import { AddProceedRecipientCommand } from "@command/security/proceedRecipients/addProceedRecipient/AddProceedRecipientCommand";
import { RemoveProceedRecipientCommand } from "@command/security/proceedRecipients/removeProceedRecipient/RemoveProceedRecipientCommand";
import { UpdateProceedRecipientDataCommand } from "@command/security/proceedRecipients/updateProceedRecipientData/UpdateProceedRecipientDataCommand";
import { CommandBus } from "@core/command/CommandBus";
import ContractId from "@domain/context/contract/ContractId";
import { CastRegulationSubType, CastRegulationType } from "@domain/context/factory/RegulationType";
import { SecurityProps } from "@domain/context/security/Security";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";
import { GetPrincipalForQuery } from "@query/bond/get/getPrincipalFor/GetPrincipalForQuery";
import { GetSecurityQuery } from "@query/security/get/GetSecurityQuery";
import { GetProceedRecipientDataQuery } from "@query/security/proceedRecipient/getProceedRecipientData/GetProceedRecipientDataQuery";
import { GetProceedRecipientsQuery } from "@query/security/proceedRecipient/getProceedRecipients/GetProceedRecipientsQuery";
import { GetProceedRecipientsCountQuery } from "@query/security/proceedRecipient/getProceedRecipientsCount/GetProceedRecipientsCountQuery";
import { IsProceedRecipientQuery } from "@query/security/proceedRecipient/isProceedRecipient/IsProceedRecipientQuery";
import NetworkService from "@service/network/NetworkService";
import {
  GetProceedRecipientDataRequest,
  GetProceedRecipientsCountRequest,
  GetProceedRecipientsRequest,
} from "../request";
import AddProceedRecipientRequest from "../request/bond/AddProceedRecipientRequest";
import CreateBondFixedRateRequest from "../request/bond/CreateBondFixedRateRequest";
import CreateBondKpiLinkedRateRequest from "../request/bond/CreateBondKpiLinkedRateRequest";
import CreateBondRequest from "../request/bond/CreateBondRequest";
import CreateTrexSuiteBondRequest from "../request/bond/CreateTrexSuiteBondRequest";
import FullRedeemAtMaturityRequest from "../request/bond/FullRedeemAtMaturityRequest";
import GetBondDetailsRequest from "../request/bond/GetBondDetailsRequest";
import GetPrincipalForRequest from "../request/bond/GetPrincipalForRequest";
import IsProceedRecipientRequest from "../request/bond/IsProceedRecipientRequest";
import RedeemAtMaturityByPartitionRequest from "../request/bond/RedeemAtMaturityByPartitionRequest";
import RemoveProceedRecipientRequest from "../request/bond/RemoveProceedRecipientRequest";
import UpdateMaturityDateRequest from "../request/bond/UpdateMaturityDateRequest";
import UpdateProceedRecipientDataRequest from "../request/bond/UpdateProceedRecipientDataRequest";
import { AddKpiDataRequest } from "../request/kpis/AddKpiDataRequest";
import BondDetailsViewModel from "../response/BondDetailsViewModel";
import PrincipalForViewModel from "../response/PrincipalForViewModel";
import { SecurityViewModel } from "../security/Security";

interface IBondInPort {
  create(request: CreateBondRequest): Promise<{ security: SecurityViewModel; transactionId: string }>;
  createFixedRate(request: CreateBondFixedRateRequest): Promise<{ security: SecurityViewModel; transactionId: string }>;
  getBondDetails(request: GetBondDetailsRequest): Promise<BondDetailsViewModel>;
  getPrincipalFor(request: GetPrincipalForRequest): Promise<PrincipalForViewModel>;
  updateMaturityDate(request: UpdateMaturityDateRequest): Promise<{ payload: boolean; transactionId: string }>;
  redeemAtMaturityByPartition(
    request: RedeemAtMaturityByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  fullRedeemAtMaturity(request: FullRedeemAtMaturityRequest): Promise<{ payload: boolean; transactionId: string }>;
  createTrexSuite(request: CreateTrexSuiteBondRequest): Promise<{ security: SecurityViewModel; transactionId: string }>;
  addKpiData(request: AddKpiDataRequest): Promise<{ transactionId: string }>;
  addProceedRecipient(request: AddProceedRecipientRequest): Promise<{ payload: boolean; transactionId: string }>;
  removeProceedRecipient(request: RemoveProceedRecipientRequest): Promise<{ payload: boolean; transactionId: string }>;
  updateProceedRecipientData(
    request: UpdateProceedRecipientDataRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  isProceedRecipient(request: IsProceedRecipientRequest): Promise<{ payload: boolean }>;
  getProceedRecipientData(request: GetProceedRecipientDataRequest): Promise<{ payload: string }>;
  getProceedRecipientsCount(request: GetProceedRecipientsCountRequest): Promise<{ payload: number }>;
  getProceedRecipients(request: GetProceedRecipientsRequest): Promise<{ payload: string[] }>;
  createKpiLinkedRate(
    req: CreateBondKpiLinkedRateRequest,
  ): Promise<{ security: SecurityViewModel; transactionId: string }>;
}

class BondInPort implements IBondInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly networkService: NetworkService = Injectable.resolve(NetworkService),
  ) {}

  @LogError
  async create(req: CreateBondRequest): Promise<{ security: SecurityViewModel; transactionId: string }> {
    ValidatedRequest.handleValidation("CreateBondRequest", req);
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
      maxSupply: BigDecimal.fromString(req.numberOfUnits),
      regulationType: CastRegulationType.fromNumber(req.regulationType),
      regulationsubType: CastRegulationSubType.fromNumber(req.regulationSubType),
      isCountryControlListWhiteList: req.isCountryControlListWhiteList,
      countries: req.countries,
      info: req.info,
    };

    const createResponse = await this.commandBus.execute(
      new CreateBondCommand(
        newSecurity,
        req.currency,
        req.nominalValue,
        req.nominalValueDecimals,
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
  async createFixedRate(
    req: CreateBondFixedRateRequest,
  ): Promise<{ security: SecurityViewModel; transactionId: string }> {
    ValidatedRequest.handleValidation("CreateBondFixedRateRequest", req);
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
      maxSupply: BigDecimal.fromString(req.numberOfUnits),
      regulationType: CastRegulationType.fromNumber(req.regulationType),
      regulationsubType: CastRegulationSubType.fromNumber(req.regulationSubType),
      isCountryControlListWhiteList: req.isCountryControlListWhiteList,
      countries: req.countries,
      info: req.info,
    };

    const createResponse = await this.commandBus.execute(
      new CreateBondFixedRateCommand(
        newSecurity,
        req.currency,
        req.nominalValue,
        req.nominalValueDecimals,
        req.startingDate,
        req.maturityDate,
        req.rate,
        req.rateDecimals,
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
  async createKpiLinkedRate(
    req: CreateBondKpiLinkedRateRequest,
  ): Promise<{ security: SecurityViewModel; transactionId: string }> {
    ValidatedRequest.handleValidation("CreateBondKpiLinkedRateRequest", req);
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
      maxSupply: BigDecimal.fromString(req.numberOfUnits),
      regulationType: CastRegulationType.fromNumber(req.regulationType),
      regulationsubType: CastRegulationSubType.fromNumber(req.regulationSubType),
      isCountryControlListWhiteList: req.isCountryControlListWhiteList,
      countries: req.countries,
      info: req.info,
    };

    const createResponse = await this.commandBus.execute(
      new CreateBondKpiLinkedRateCommand(
        newSecurity,
        req.currency,
        req.nominalValue,
        req.nominalValueDecimals,
        req.startingDate,
        req.maturityDate,
        req.maxRate,
        req.baseRate,
        req.minRate,
        req.startPeriod,
        req.startRate,
        req.missedPenalty,
        req.reportPeriod,
        req.rateDecimals,
        req.maxDeviationCap,
        req.baseLine,
        req.maxDeviationFloor,
        req.impactDataDecimals,
        req.adjustmentPrecision,
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
  async getBondDetails(request: GetBondDetailsRequest): Promise<BondDetailsViewModel> {
    ValidatedRequest.handleValidation("GetBondDetailsRequest", request);

    const res = await this.queryBus.execute(new GetBondDetailsQuery(request.bondId));

    const bondDetails: BondDetailsViewModel = {
      currency: res.bond.currency,
      nominalValue: res.bond.nominalValue.toString(),
      nominalValueDecimals: res.bond.nominalValueDecimals,
      startingDate: new Date(res.bond.startingDate * ONE_THOUSAND),
      maturityDate: new Date(res.bond.maturityDate * ONE_THOUSAND),
    };

    return bondDetails;
  }

  @LogError
  async getPrincipalFor(request: GetPrincipalForRequest): Promise<PrincipalForViewModel> {
    ValidatedRequest.handleValidation("GetPrincipalForRequest", request);

    const res = await this.queryBus.execute(new GetPrincipalForQuery(request.targetId, request.securityId));

    const principalFor: PrincipalForViewModel = {
      numerator: res.numerator,
      denominator: res.denominator,
    };

    return principalFor;
  }

  @LogError
  async updateMaturityDate(request: UpdateMaturityDateRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { maturityDate, securityId } = request;
    ValidatedRequest.handleValidation("UpdateMaturityDateRequest", request);

    return await this.commandBus.execute(new UpdateMaturityDateCommand(maturityDate, securityId));
  }

  @LogError
  async redeemAtMaturityByPartition(
    request: RedeemAtMaturityByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, partitionId, sourceId, amount } = request;
    ValidatedRequest.handleValidation(RedeemAtMaturityByPartitionRequest.name, request);

    return await this.commandBus.execute(
      new RedeemAtMaturityByPartitionCommand(securityId, partitionId, sourceId, amount),
    );
  }

  @LogError
  async fullRedeemAtMaturity(
    request: FullRedeemAtMaturityRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, sourceId } = request;
    ValidatedRequest.handleValidation(FullRedeemAtMaturityRequest.name, request);

    return await this.commandBus.execute(new FullRedeemAtMaturityCommand(securityId, sourceId));
  }

  @LogError
  async createTrexSuite(
    req: CreateTrexSuiteBondRequest,
  ): Promise<{ security: SecurityViewModel; transactionId: string }> {
    ValidatedRequest.handleValidation("CreateTrexSuiteBondRequest", req);

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
      maxSupply: BigDecimal.fromString(req.numberOfUnits),
      regulationType: CastRegulationType.fromNumber(req.regulationType),
      regulationsubType: CastRegulationSubType.fromNumber(req.regulationSubType),
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
        req.nominalValueDecimals,
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
  async updateProceedRecipientData(
    request: UpdateProceedRecipientDataRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation(UpdateProceedRecipientDataRequest.name, request);
    return await this.commandBus.execute(
      new UpdateProceedRecipientDataCommand(request.securityId, request.proceedRecipientId, request.data),
    );
  }

  @LogError
  async removeProceedRecipient(
    request: RemoveProceedRecipientRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation(RemoveProceedRecipientRequest.name, request);
    return await this.commandBus.execute(
      new RemoveProceedRecipientCommand(request.securityId, request.proceedRecipientId),
    );
  }

  @LogError
  async addProceedRecipient(request: AddProceedRecipientRequest): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation(AddProceedRecipientRequest.name, request);
    return await this.commandBus.execute(
      new AddProceedRecipientCommand(request.securityId, request.proceedRecipientId, request.data),
    );
  }

  @LogError
  async getProceedRecipients(request: GetProceedRecipientsRequest): Promise<{ payload: string[] }> {
    ValidatedRequest.handleValidation(GetProceedRecipientsRequest.name, request);
    return await this.queryBus.execute(
      new GetProceedRecipientsQuery(request.securityId, request.pageIndex, request.pageSize),
    );
  }

  @LogError
  async getProceedRecipientsCount(request: GetProceedRecipientsCountRequest): Promise<{ payload: number }> {
    ValidatedRequest.handleValidation(GetProceedRecipientsCountRequest.name, request);
    return await this.queryBus.execute(new GetProceedRecipientsCountQuery(request.securityId));
  }

  @LogError
  async getProceedRecipientData(request: GetProceedRecipientDataRequest): Promise<{ payload: string }> {
    ValidatedRequest.handleValidation(GetProceedRecipientDataRequest.name, request);
    return await this.queryBus.execute(
      new GetProceedRecipientDataQuery(request.securityId, request.proceedRecipientId),
    );
  }

  @LogError
  async isProceedRecipient(request: IsProceedRecipientRequest): Promise<{ payload: boolean }> {
    ValidatedRequest.handleValidation(IsProceedRecipientRequest.name, request);
    return await this.queryBus.execute(new IsProceedRecipientQuery(request.securityId, request.proceedRecipientId));
  }

  @LogError
  async addKpiData(request: AddKpiDataRequest): Promise<{ transactionId: string }> {
    ValidatedRequest.handleValidation(AddKpiDataRequest.name, request);
    const response = await this.commandBus.execute(
      new AddKpiDataCommand(request.securityId, request.date, request.value, request.project),
    );
    return { transactionId: response.transactionId };
  }
}

const BondToken = new BondInPort();
export default BondToken;
