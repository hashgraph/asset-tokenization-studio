// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import Injectable from "@core/injectable/Injectable";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { CommandBus } from "@core/command/CommandBus";
import ContractId from "@domain/context/contract/ContractId";
import { ONE_THOUSAND } from "@domain/context/shared/SecurityDate";
import { toSecurityProps } from "../security/SecurityPropsMapper";
import { GetSecurityQuery } from "@query/security/get/GetSecurityQuery";
import NetworkService from "@service/network/NetworkService";
import { CreateLoanCommand } from "@command/loan/create/CreateLoanCommand";
import { SetLoanDetailsCommand } from "@command/loan/setDetails/SetLoanDetailsCommand";
import { GetLoanDetailsQuery } from "@query/loan/get/getLoanDetails/GetLoanDetailsQuery";
import CreateLoanRequest from "../request/loan/CreateLoanRequest";
import GetLoanDetailsRequest from "../request/loan/GetLoanDetailsRequest";
import SetLoanDetailsRequest from "../request/loan/SetLoanDetailsRequest";
import LoanDetailsViewModel from "../response/LoanDetailsViewModel";
import { SecurityViewModel } from "../security/Security";

interface ILoanInPort {
  create(request: CreateLoanRequest): Promise<{ security: SecurityViewModel; transactionId: string }>;
  getLoanDetails(request: GetLoanDetailsRequest): Promise<LoanDetailsViewModel>;
  setLoanDetails(request: SetLoanDetailsRequest): Promise<{ transactionId: string }>;
}

class LoanInPort implements ILoanInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly networkService: NetworkService = Injectable.resolve(NetworkService),
  ) {}

  @LogError
  async create(req: CreateLoanRequest): Promise<{ security: SecurityViewModel; transactionId: string }> {
    ValidatedRequest.handleValidation("CreateLoanRequest", req);
    const { diamondOwnerAccount, externalPausesIds, externalControlListsIds, externalKycListsIds } = req;

    const securityFactory = this.networkService.configuration.factoryAddress;
    const resolver = this.networkService.configuration.resolverAddress;

    const createResponse = await this.commandBus.execute(
      new CreateLoanCommand(
        toSecurityProps(req),
        securityFactory ? new ContractId(securityFactory) : undefined,
        resolver ? new ContractId(resolver) : undefined,
        req.configId,
        req.configVersion,
        diamondOwnerAccount,
        req.currency,
        req.nominalValue,
        req.nominalValueDecimals,
        req.startingDate,
        req.maturityDate,
        req.loanStructureType,
        req.repaymentType,
        req.interestType,
        req.originatorAccount,
        req.servicerAccount,
        req.signingDate ?? "0",
        req.baseReferenceRate ?? 0,
        req.floorRate ?? "0",
        req.capRate ?? "0",
        req.rateMargin ?? "0",
        req.dayCount ?? 0,
        req.paymentFrequency ?? 0,
        req.firstAccrualDate ?? "0",
        req.prepaymentPenalty ?? "0",
        req.commitmentFee ?? "0",
        req.utilizationFee ?? "0",
        req.utilizationFeeType ?? 0,
        req.servicingFee ?? "0",
        req.internalRiskGrade ?? "",
        req.defaultProbability ?? "0",
        req.lossGivenDefault ?? "0",
        req.totalCollateralValue ?? "0",
        req.loanToValue ?? "0",
        req.performanceStatus ?? 0,
        req.daysPastDue ?? "0",
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
      security: securityCreated ? { ...res } : {},
      transactionId: createResponse.transactionId,
    };
  }

  @LogError
  async getLoanDetails(request: GetLoanDetailsRequest): Promise<LoanDetailsViewModel> {
    ValidatedRequest.handleValidation("GetLoanDetailsRequest", request);

    const res = await this.queryBus.execute(new GetLoanDetailsQuery(request.loanId));

    const loanDetails: LoanDetailsViewModel = {
      currency: res.loan.currency,
      startingDate: new Date(res.loan.startingDate * ONE_THOUSAND),
      maturityDate: new Date(res.loan.maturityDate * ONE_THOUSAND),
      loanStructureType: res.loan.loanStructureType,
      repaymentType: res.loan.repaymentType,
      interestType: res.loan.interestType,
      signingDate: new Date(res.loan.signingDate * ONE_THOUSAND),
      originatorAccount: res.loan.originatorAccount,
      servicerAccount: res.loan.servicerAccount,
      baseReferenceRate: res.loan.baseReferenceRate,
      floorRate: res.loan.floorRate.toString(),
      capRate: res.loan.capRate.toString(),
      rateMargin: res.loan.rateMargin.toString(),
      dayCount: res.loan.dayCount,
      paymentFrequency: res.loan.paymentFrequency,
      firstAccrualDate: new Date(res.loan.firstAccrualDate * ONE_THOUSAND),
      prepaymentPenalty: res.loan.prepaymentPenalty.toString(),
      commitmentFee: res.loan.commitmentFee.toString(),
      utilizationFee: res.loan.utilizationFee.toString(),
      utilizationFeeType: res.loan.utilizationFeeType,
      servicingFee: res.loan.servicingFee.toString(),
      internalRiskGrade: res.loan.internalRiskGrade,
      defaultProbability: res.loan.defaultProbability.toString(),
      lossGivenDefault: res.loan.lossGivenDefault.toString(),
      totalCollateralValue: res.loan.totalCollateralValue.toString(),
      loanToValue: res.loan.loanToValue.toString(),
      performanceStatus: res.loan.performanceStatus,
      daysPastDue: res.loan.daysPastDue.toString(),
    };

    return loanDetails;
  }

  @LogError
  async setLoanDetails(request: SetLoanDetailsRequest): Promise<{ transactionId: string }> {
    ValidatedRequest.handleValidation("SetLoanDetailsRequest", request);

    const response = await this.commandBus.execute(
      new SetLoanDetailsCommand(
        request.loanId,
        request.currency,
        request.startingDate,
        request.maturityDate,
        request.loanStructureType,
        request.repaymentType,
        request.interestType,
        request.signingDate,
        request.originatorAccount,
        request.servicerAccount,
        request.baseReferenceRate,
        request.floorRate,
        request.capRate,
        request.rateMargin,
        request.dayCount,
        request.paymentFrequency,
        request.firstAccrualDate,
        request.prepaymentPenalty,
        request.commitmentFee,
        request.utilizationFee,
        request.utilizationFeeType,
        request.servicingFee,
        request.internalRiskGrade,
        request.defaultProbability,
        request.lossGivenDefault,
        request.totalCollateralValue,
        request.loanToValue,
        request.performanceStatus,
        request.daysPastDue,
      ),
    );

    return { transactionId: response.transactionId };
  }
}

const LoanToken = new LoanInPort();
export default LoanToken;
