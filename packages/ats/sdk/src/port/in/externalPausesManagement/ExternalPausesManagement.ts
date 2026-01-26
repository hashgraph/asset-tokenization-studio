// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
import { LogError } from "@core/decorator/LogErrorDecorator";
import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import {
  AddExternalPauseRequest,
  RemoveExternalPauseRequest,
  UpdateExternalPausesRequest,
  GetExternalPausesCountRequest,
  GetExternalPausesMembersRequest,
  IsExternalPauseRequest,
  IsPausedMockRequest,
  SetPausedMockRequest,
} from "../request/index";
import { UpdateExternalPausesCommand } from "@command/security/externalPauses/updateExternalPauses/UpdateExternalPausesCommand";
import { SetPausedMockCommand } from "@command/security/externalPauses/mock/setPaused/SetPausedMockCommand";
import { QueryBus } from "@core/query/QueryBus";
import { IsPausedMockQuery } from "@query/security/externalPauses/mock/isPaused/IsPausedMockQuery";
import { AddExternalPauseCommand } from "@command/security/externalPauses/addExternalPause/AddExternalPauseCommand";
import { RemoveExternalPauseCommand } from "@command/security/externalPauses/removeExternalPause/RemoveExternalPauseCommand";
import { IsExternalPauseQuery } from "@query/security/externalPauses/isExternalPause/IsExternalPauseQuery";
import { GetExternalPausesCountQuery } from "@query/security/externalPauses/getExternalPausesCount/GetExternalPausesCountQuery";
import { GetExternalPausesMembersQuery } from "@query/security/externalPauses/getExternalPausesMembers/GetExternalPausesMembersQuery";
import { CreateExternalPauseMockCommand } from "@command/security/externalPauses/mock/createExternalPauseMock/CreateExternalPauseMockCommand";
import ValidatedRequest from "@core/validation/ValidatedArgs";

interface IExternalPausesInPort {
  updateExternalPauses(request: UpdateExternalPausesRequest): Promise<{ payload: boolean; transactionId: string }>;
  addExternalPause(request: AddExternalPauseRequest): Promise<{ payload: boolean; transactionId: string }>;
  removeExternalPause(request: RemoveExternalPauseRequest): Promise<{ payload: boolean; transactionId: string }>;
  isExternalPause(request: IsExternalPauseRequest): Promise<boolean>;
  getExternalPausesCount(request: GetExternalPausesCountRequest): Promise<number>;
  getExternalPausesMembers(request: GetExternalPausesMembersRequest): Promise<string[]>;
}

interface IExternalPausesMocksInPort {
  setPausedMock(request: SetPausedMockRequest): Promise<{ payload: boolean; transactionId: string }>;
  isPausedMock(request: IsPausedMockRequest): Promise<boolean>;
  createMock(): Promise<string>;
}

class ExternalPausesInPort implements IExternalPausesInPort, IExternalPausesMocksInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
  ) {}

  @LogError
  async updateExternalPauses(
    request: UpdateExternalPausesRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, externalPausesAddresses, actives } = request;
    ValidatedRequest.handleValidation("UpdateExternalPausesRequest", request);

    return await this.commandBus.execute(new UpdateExternalPausesCommand(securityId, externalPausesAddresses, actives));
  }

  @LogError
  async addExternalPause(request: AddExternalPauseRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, externalPauseAddress } = request;
    ValidatedRequest.handleValidation("AddExternalPauseRequest", request);

    return await this.commandBus.execute(new AddExternalPauseCommand(securityId, externalPauseAddress));
  }

  @LogError
  async removeExternalPause(request: RemoveExternalPauseRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, externalPauseAddress } = request;
    ValidatedRequest.handleValidation("RemoveExternalPauseRequest", request);

    return await this.commandBus.execute(new RemoveExternalPauseCommand(securityId, externalPauseAddress));
  }

  @LogError
  async isExternalPause(request: IsExternalPauseRequest): Promise<boolean> {
    const { securityId, externalPauseAddress } = request;
    ValidatedRequest.handleValidation("IsExternalPauseRequest", request);

    return (await this.queryBus.execute(new IsExternalPauseQuery(securityId, externalPauseAddress))).payload;
  }

  @LogError
  async getExternalPausesCount(request: GetExternalPausesCountRequest): Promise<number> {
    const { securityId } = request;
    ValidatedRequest.handleValidation("GetExternalPausesCountRequest", request);

    return (await this.queryBus.execute(new GetExternalPausesCountQuery(securityId))).payload;
  }

  @LogError
  async getExternalPausesMembers(request: GetExternalPausesMembersRequest): Promise<string[]> {
    const { securityId, start, end } = request;
    ValidatedRequest.handleValidation("GetExternalPausesMembersRequest", request);

    return (await this.queryBus.execute(new GetExternalPausesMembersQuery(securityId, start, end))).payload;
  }

  @LogError
  async setPausedMock(request: SetPausedMockRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { contractId, paused } = request;
    ValidatedRequest.handleValidation("SetPausedMockRequest", request);

    return await this.commandBus.execute(new SetPausedMockCommand(contractId, paused));
  }

  @LogError
  async isPausedMock(request: IsPausedMockRequest): Promise<boolean> {
    const { contractId } = request;
    ValidatedRequest.handleValidation("IsPausedMockRequest", request);

    return (await this.queryBus.execute(new IsPausedMockQuery(contractId))).payload;
  }

  @LogError
  async createMock(): Promise<string> {
    return (await this.commandBus.execute(new CreateExternalPauseMockCommand())).payload;
  }
}

const ExternalPausesManagement = new ExternalPausesInPort();
export default ExternalPausesManagement;
