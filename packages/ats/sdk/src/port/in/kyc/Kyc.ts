// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import { QueryBus } from "@core/query/QueryBus";
import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import GrantKycRequest from "../request/security/kyc/GrantKycRequest";
import RevokeKycRequest from "../request/security/kyc/RevokeKycRequest";
import GetKycAccountsCountRequest from "../request/security/kyc/GetKycAccountsCountRequest";
import GetKycForRequest from "../request/security/kyc/GetKycForRequest";
import { GrantKycCommand } from "@command/security/kyc/grantKyc/GrantKycCommand";
import { RevokeKycCommand } from "@command/security/kyc/revokeKyc/RevokeKycCommand";
import { GetKycForQuery } from "@query/security/kyc/getKycFor/GetKycForQuery";
import { GetKycAccountsCountQuery } from "@query/security/kyc/getKycAccountsCount/GetKycAccountsCountQuery";
import { GetKycAccountsDataQuery } from "@query/security/kyc/getKycAccountsData/GetKycAccountsDataQuery";
import KycViewModel from "../response/KycViewModel";
import KycAccountDataViewModel from "../response/KycAccountDataViewModel";
import GetKycAccountsDataRequest from "../request/security/kyc/GetKycAccountsDataRequest";
import GetKycStatusForRequest from "../request/security/kyc/GetKycStatusForRequest";
import { GetKycStatusForQuery } from "@query/security/kyc/getKycStatusFor/GetKycStatusForQuery";
import {
  ActivateInternalKycRequest,
  DeactivateInternalKycRequest,
  IsInternalKycActivatedRequest,
} from "../request/index";
import { ActivateInternalKycCommand } from "@command/security/kyc/activateInternalKyc/ActivateInternalKycCommand";
import { DeactivateInternalKycCommand } from "@command/security/kyc/deactivateInternalKyc/DeactivateInternalKycCommand";
import { IsInternalKycActivatedQuery } from "@query/security/kyc/isInternalKycActivated/IsInternalKycActivatedQuery";

interface IKycInPort {
  grantKyc(request: GrantKycRequest): Promise<{ payload: boolean; transactionId: string }>;
  revokeKyc(request: RevokeKycRequest): Promise<{ payload: boolean; transactionId: string }>;
  activateInternalKyc(request: ActivateInternalKycRequest): Promise<{ payload: boolean; transactionId: string }>;
  deactivateInternalKyc(request: DeactivateInternalKycRequest): Promise<{ payload: boolean; transactionId: string }>;
  getKycAccountsCount(request: GetKycAccountsCountRequest): Promise<number>;
  getKycFor(request: GetKycForRequest): Promise<KycViewModel>;
  getKycAccountsData(request: GetKycAccountsDataRequest): Promise<KycViewModel[]>;
  getKycStatusFor(request: GetKycStatusForRequest): Promise<number>;
  isInternalKycActivated(request: IsInternalKycActivatedRequest): Promise<boolean>;
}

class KycInPort implements IKycInPort {
  constructor(
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
  ) {}

  @LogError
  async grantKyc(request: GrantKycRequest): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("GrantKycRequest", request);

    return await this.commandBus.execute(new GrantKycCommand(request.securityId, request.targetId, request.vcBase64));
  }

  @LogError
  async revokeKyc(request: RevokeKycRequest): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("RevokeKycRequest", request);

    return await this.commandBus.execute(new RevokeKycCommand(request.securityId, request.targetId));
  }

  @LogError
  async getKycFor(request: GetKycForRequest): Promise<KycViewModel> {
    ValidatedRequest.handleValidation("GetKycForRequest", request);

    const res = (await this.queryBus.execute(new GetKycForQuery(request.securityId, request.targetId))).payload;

    const kyc: KycViewModel = {
      validFrom: res.validFrom,
      validTo: res.validTo,
      vcId: res.vcId,
      issuer: res.issuer,
      status: res.status,
    };

    return kyc;
  }

  @LogError
  async getKycAccountsCount(request: GetKycAccountsCountRequest): Promise<number> {
    ValidatedRequest.handleValidation("GetKycAccountsCountRequest", request);

    const res = (await this.queryBus.execute(new GetKycAccountsCountQuery(request.securityId, request.kycStatus)))
      .payload;

    return res;
  }

  @LogError
  async getKycAccountsData(request: GetKycAccountsDataRequest): Promise<KycAccountDataViewModel[]> {
    ValidatedRequest.handleValidation("GetKycAccountsData", request);

    const res = (
      await this.queryBus.execute(
        new GetKycAccountsDataQuery(request.securityId, request.kycStatus, request.start, request.end),
      )
    ).payload;

    const kycData: KycAccountDataViewModel[] = res.map((item) => ({
      account: item.account,
      validFrom: item.validFrom,
      validTo: item.validTo,
      vcId: item.vcId,
      issuer: item.issuer,
      status: item.status,
    }));

    return kycData;
  }

  @LogError
  async getKycStatusFor(request: GetKycStatusForRequest): Promise<number> {
    ValidatedRequest.handleValidation("GetKycStatusForRequest", request);

    const res = (await this.queryBus.execute(new GetKycStatusForQuery(request.securityId, request.targetId))).payload;

    return res;
  }

  @LogError
  async activateInternalKyc(request: ActivateInternalKycRequest): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("ActivateInternalKycRequest", request);

    return await this.commandBus.execute(new ActivateInternalKycCommand(request.securityId));
  }

  @LogError
  async deactivateInternalKyc(
    request: DeactivateInternalKycRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation("DeactivateInternalKycRequest", request);

    return await this.commandBus.execute(new DeactivateInternalKycCommand(request.securityId));
  }

  @LogError
  async isInternalKycActivated(request: IsInternalKycActivatedRequest): Promise<boolean> {
    ValidatedRequest.handleValidation("IsInternalKycActivatedRequest", request);

    return (await this.queryBus.execute(new IsInternalKycActivatedQuery(request.securityId))).payload;
  }
}

const Kyc = new KycInPort();
export default Kyc;
