// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
import { LogError } from "@core/decorator/LogErrorDecorator";
import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import {
  AddExternalControlListRequest,
  RemoveExternalControlListRequest,
  UpdateExternalControlListsRequest,
  GetExternalControlListsCountRequest,
  GetExternalControlListsMembersRequest,
  IsExternalControlListRequest,
  AddToBlackListMockRequest,
  AddToWhiteListMockRequest,
  RemoveFromBlackListMockRequest,
  RemoveFromWhiteListMockRequest,
  IsAuthorizedBlackListMockRequest,
  IsAuthorizedWhiteListMockRequest,
} from "../request/index";
import { UpdateExternalControlListsCommand } from "@command/security/externalControlLists/updateExternalControlLists/UpdateExternalControlListsCommand";
import { AddExternalControlListCommand } from "@command/security/externalControlLists/addExternalControlList/AddExternalControlListCommand";
import { RemoveExternalControlListCommand } from "@command/security/externalControlLists/removeExternalControlList/RemoveExternalControlListCommand";
import { QueryBus } from "@core/query/QueryBus";
import { IsExternalControlListQuery } from "@query/security/externalControlLists/isExternalControlList/IsExternalControlListQuery";
import { GetExternalControlListsCountQuery } from "@query/security/externalControlLists/getExternalControlListsCount/GetExternalControlListsCountQuery";
import { GetExternalControlListsMembersQuery } from "@query/security/externalControlLists/getExternalControlListsMembers/GetExternalControlListsMembersQuery";
import { AddToBlackListMockCommand } from "@command/security/externalControlLists/mock/addToBlackListMock/AddToBlackListMockCommand";
import { AddToWhiteListMockCommand } from "@command/security/externalControlLists/mock/addToWhiteListMock/AddToWhiteListMockCommand";
import { RemoveFromBlackListMockCommand } from "@command/security/externalControlLists/mock/removeFromBlackListMock/RemoveFromBlackListMockCommand";
import { RemoveFromWhiteListMockCommand } from "@command/security/externalControlLists/mock/removeFromWhiteListMock/RemoveFromWhiteListMockCommand";
import { CreateExternalBlackListMockCommand } from "@command/security/externalControlLists/mock/createExternalBlackListMock/CreateExternalBlackListMockCommand";
import { CreateExternalWhiteListMockCommand } from "@command/security/externalControlLists/mock/createExternalWhiteListMock/CreateExternalWhiteListMockCommand";
import { IsAuthorizedBlackListMockQuery } from "@query/security/externalControlLists/mock/isAuthorizedBlackListMock/IsAuthorizedBlackListMockQuery";
import { IsAuthorizedWhiteListMockQuery } from "@query/security/externalControlLists/mock/isAuthorizedWhiteListMock/IsAuthorizedWhiteListMockQuery";
import ValidatedRequest from "@core/validation/ValidatedArgs";

interface IExternalControlListsInPort {
  updateExternalControlLists(
    request: UpdateExternalControlListsRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  addExternalControlList(request: AddExternalControlListRequest): Promise<{ payload: boolean; transactionId: string }>;
  removeExternalControlList(
    request: RemoveExternalControlListRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  isExternalControlList(request: IsExternalControlListRequest): Promise<boolean>;
  getExternalControlListsCount(request: GetExternalControlListsCountRequest): Promise<number>;
  getExternalControlListsMembers(request: GetExternalControlListsMembersRequest): Promise<string[]>;
}

interface IExternalControlListsInPortMocksInPort {
  addToBlackListMock(request: AddToBlackListMockRequest): Promise<{ payload: boolean; transactionId: string }>;
  addToWhiteListMock(request: AddToWhiteListMockRequest): Promise<{ payload: boolean; transactionId: string }>;
  removeFromBlackListMock(
    request: RemoveFromBlackListMockRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  removeFromWhiteListMock(
    request: RemoveFromWhiteListMockRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  createExternalBlackListMock(): Promise<string>;
  createExternalWhiteListMock(): Promise<string>;
  isAuthorizedBlackListMock(request: IsAuthorizedBlackListMockRequest): Promise<boolean>;
  isAuthorizedWhiteListMock(request: IsAuthorizedWhiteListMockRequest): Promise<boolean>;
}

class ExternalControlListsInPort implements IExternalControlListsInPort, IExternalControlListsInPortMocksInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
  ) {}

  @LogError
  async updateExternalControlLists(
    request: UpdateExternalControlListsRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, externalControlListsAddresses, actives } = request;
    ValidatedRequest.handleValidation("UpdateExternalControlListsRequest", request);

    return await this.commandBus.execute(
      new UpdateExternalControlListsCommand(securityId, externalControlListsAddresses, actives),
    );
  }

  @LogError
  async addExternalControlList(
    request: AddExternalControlListRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, externalControlListAddress } = request;
    ValidatedRequest.handleValidation("AddExternalControlListRequest", request);

    return await this.commandBus.execute(new AddExternalControlListCommand(securityId, externalControlListAddress));
  }

  @LogError
  async removeExternalControlList(
    request: RemoveExternalControlListRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, externalControlListAddress } = request;
    ValidatedRequest.handleValidation("RemoveExternalControlListRequest", request);

    return await this.commandBus.execute(new RemoveExternalControlListCommand(securityId, externalControlListAddress));
  }

  @LogError
  async isExternalControlList(request: IsExternalControlListRequest): Promise<boolean> {
    const { securityId, externalControlListAddress } = request;
    ValidatedRequest.handleValidation("IsExternalControlListRequest", request);

    return (await this.queryBus.execute(new IsExternalControlListQuery(securityId, externalControlListAddress)))
      .payload;
  }

  @LogError
  async getExternalControlListsCount(request: GetExternalControlListsCountRequest): Promise<number> {
    const { securityId } = request;
    ValidatedRequest.handleValidation("GetExternalControlListsCountRequest", request);

    return (await this.queryBus.execute(new GetExternalControlListsCountQuery(securityId))).payload;
  }

  @LogError
  async getExternalControlListsMembers(request: GetExternalControlListsMembersRequest): Promise<string[]> {
    const { securityId, start, end } = request;
    ValidatedRequest.handleValidation("GetExternalControlListsMembersRequest", request);

    return (await this.queryBus.execute(new GetExternalControlListsMembersQuery(securityId, start, end))).payload;
  }

  @LogError
  async addToBlackListMock(request: AddToBlackListMockRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { contractId, targetId } = request;
    ValidatedRequest.handleValidation("AddToBlackListMockRequest", request);

    return await this.commandBus.execute(new AddToBlackListMockCommand(contractId, targetId));
  }

  @LogError
  async addToWhiteListMock(request: AddToWhiteListMockRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { contractId, targetId } = request;
    ValidatedRequest.handleValidation("AddToWhiteListMockRequest", request);

    return await this.commandBus.execute(new AddToWhiteListMockCommand(contractId, targetId));
  }

  @LogError
  async removeFromBlackListMock(
    request: RemoveFromBlackListMockRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { contractId, targetId } = request;
    ValidatedRequest.handleValidation("RemoveFromBlackListMockRequest", request);

    return await this.commandBus.execute(new RemoveFromBlackListMockCommand(contractId, targetId));
  }

  @LogError
  async removeFromWhiteListMock(
    request: RemoveFromWhiteListMockRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { contractId, targetId } = request;
    ValidatedRequest.handleValidation("RemoveFromWhiteListMockRequest", request);

    return await this.commandBus.execute(new RemoveFromWhiteListMockCommand(contractId, targetId));
  }

  @LogError
  async createExternalBlackListMock(): Promise<string> {
    return (await this.commandBus.execute(new CreateExternalBlackListMockCommand())).payload;
  }

  @LogError
  async createExternalWhiteListMock(): Promise<string> {
    return (await this.commandBus.execute(new CreateExternalWhiteListMockCommand())).payload;
  }

  @LogError
  async isAuthorizedBlackListMock(request: IsAuthorizedBlackListMockRequest): Promise<boolean> {
    const { contractId, targetId } = request;
    ValidatedRequest.handleValidation("IsAuthorizedBlackListMockRequest", request);

    return (await this.queryBus.execute(new IsAuthorizedBlackListMockQuery(contractId, targetId))).payload;
  }

  @LogError
  async isAuthorizedWhiteListMock(request: IsAuthorizedWhiteListMockRequest): Promise<boolean> {
    const { contractId, targetId } = request;
    ValidatedRequest.handleValidation("IsAuthorizedWhiteListMockRequest", request);

    return (await this.queryBus.execute(new IsAuthorizedWhiteListMockQuery(contractId, targetId))).payload;
  }
}

const ExternalControlListsManagement = new ExternalControlListsInPort();
export default ExternalControlListsManagement;
