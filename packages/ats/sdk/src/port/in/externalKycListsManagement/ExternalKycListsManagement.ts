// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
import { LogError } from "@core/decorator/LogErrorDecorator";
import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import {
  AddExternalKycListRequest,
  RemoveExternalKycListRequest,
  UpdateExternalKycListsRequest,
  GetExternalKycListsCountRequest,
  GetExternalKycListsMembersRequest,
  IsExternalKycListRequest,
  IsExternallyGrantedRequest,
  GrantKycMockRequest,
  RevokeKycMockRequest,
  GetKycStatusMockRequest,
} from "../request/index";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { UpdateExternalKycListsCommand } from "@command/security/externalKycLists/updateExternalKycLists/UpdateExternalKycListsCommand";
import { AddExternalKycListCommand } from "@command/security/externalKycLists/addExternalKycList/AddExternalKycListCommand";
import { RemoveExternalKycListCommand } from "@command/security/externalKycLists/removeExternalKycList/RemoveExternalKycListCommand";
import { IsExternallyGrantedQuery } from "@query/security/externalKycLists/isExternallyGranted/IsExternallyGrantedQuery";
import { IsExternalKycListQuery } from "@query/security/externalKycLists/isExternalKycList/IsExternalKycListQuery";
import { GetExternalKycListsCountQuery } from "@query/security/externalKycLists/getExternalKycListsCount/GetExternalKycListsCountQuery";
import { GetExternalKycListsMembersQuery } from "@query/security/externalKycLists/getExternalKycListsMembers/GetExternalKycListsMembersQuery";
import { GrantKycMockCommand } from "@command/security/externalKycLists/mock/grantKycMock/GrantKycMockCommand";
import { RevokeKycMockCommand } from "@command/security/externalKycLists/mock/revokeKycMock/RevokeKycMockCommand";
import { GetKycStatusMockQuery } from "@query/security/externalKycLists/mock/getKycStatusMock/GetKycStatusMockQuery";
import { CreateExternalKycListMockCommand } from "@command/security/externalKycLists/mock/createExternalKycMock/CreateExternalKycMockCommand";

interface IExternalKycListsInPort {
  updateExternalKycLists(request: UpdateExternalKycListsRequest): Promise<{ payload: boolean; transactionId: string }>;
  addExternalKycList(request: AddExternalKycListRequest): Promise<{ payload: boolean; transactionId: string }>;
  removeExternalKycList(request: RemoveExternalKycListRequest): Promise<{ payload: boolean; transactionId: string }>;
  isExternallyGranted(request: IsExternallyGrantedRequest): Promise<boolean>;
  isExternalKycList(request: IsExternalKycListRequest): Promise<boolean>;
  getExternalKycListsCount(request: GetExternalKycListsCountRequest): Promise<number>;
  getExternalKycListsMembers(request: GetExternalKycListsMembersRequest): Promise<string[]>;
}

interface IExternalKycListsMocksInPort {
  grantKycMock(request: GrantKycMockRequest): Promise<{ payload: boolean; transactionId: string }>;
  revokeKycMock(request: RevokeKycMockRequest): Promise<{ payload: boolean; transactionId: string }>;
  getKycStatusMock(request: GetKycStatusMockRequest): Promise<number>;
  createExternalKycMock(): Promise<string>;
}

class ExternalKycListsInPort implements IExternalKycListsInPort, IExternalKycListsMocksInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
  ) {}

  @LogError
  async updateExternalKycLists(
    request: UpdateExternalKycListsRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, externalKycListsAddresses, actives } = request;
    ValidatedRequest.handleValidation("UpdateExternalKycListsRequest", request);

    return await this.commandBus.execute(
      new UpdateExternalKycListsCommand(securityId, externalKycListsAddresses, actives),
    );
  }

  @LogError
  async addExternalKycList(request: AddExternalKycListRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, externalKycListAddress } = request;
    ValidatedRequest.handleValidation("AddExternalKycListRequest", request);

    return await this.commandBus.execute(new AddExternalKycListCommand(securityId, externalKycListAddress));
  }

  @LogError
  async removeExternalKycList(
    request: RemoveExternalKycListRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, externalKycListAddress } = request;
    ValidatedRequest.handleValidation("RemoveExternalKycListRequest", request);

    return await this.commandBus.execute(new RemoveExternalKycListCommand(securityId, externalKycListAddress));
  }

  @LogError
  async isExternallyGranted(request: IsExternallyGrantedRequest): Promise<boolean> {
    const { securityId, kycStatus, targetId } = request;
    ValidatedRequest.handleValidation("IsExternallyGrantedRequest", request);

    return (await this.queryBus.execute(new IsExternallyGrantedQuery(securityId, kycStatus, targetId))).payload;
  }

  @LogError
  async isExternalKycList(request: IsExternalKycListRequest): Promise<boolean> {
    const { securityId, externalKycListAddress } = request;
    ValidatedRequest.handleValidation("IsExternalKycListRequest", request);

    return (await this.queryBus.execute(new IsExternalKycListQuery(securityId, externalKycListAddress))).payload;
  }

  @LogError
  async getExternalKycListsCount(request: GetExternalKycListsCountRequest): Promise<number> {
    const { securityId } = request;
    ValidatedRequest.handleValidation("GetExternalKycListsCountRequest", request);

    return (await this.queryBus.execute(new GetExternalKycListsCountQuery(securityId))).payload;
  }

  @LogError
  async getExternalKycListsMembers(request: GetExternalKycListsMembersRequest): Promise<string[]> {
    const { securityId, start, end } = request;
    ValidatedRequest.handleValidation("GetExternalKycListsMembersRequest", request);

    return (await this.queryBus.execute(new GetExternalKycListsMembersQuery(securityId, start, end))).payload;
  }

  @LogError
  async grantKycMock(request: GrantKycMockRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { contractId, targetId } = request;
    ValidatedRequest.handleValidation("GrantKycMockRequest", request);

    return await this.commandBus.execute(new GrantKycMockCommand(contractId, targetId));
  }

  @LogError
  async revokeKycMock(request: RevokeKycMockRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { contractId, targetId } = request;
    ValidatedRequest.handleValidation("RevokeKycMockRequest", request);

    return await this.commandBus.execute(new RevokeKycMockCommand(contractId, targetId));
  }

  @LogError
  async getKycStatusMock(request: GetKycStatusMockRequest): Promise<number> {
    const { contractId, targetId } = request;
    ValidatedRequest.handleValidation("GetKycStatusMockRequest", request);

    return (await this.queryBus.execute(new GetKycStatusMockQuery(contractId, targetId))).payload;
  }

  @LogError
  async createExternalKycMock(): Promise<string> {
    return (await this.commandBus.execute(new CreateExternalKycListMockCommand())).payload;
  }
}

const ExternalKycListsManagement = new ExternalKycListsInPort();
export default ExternalKycListsManagement;
