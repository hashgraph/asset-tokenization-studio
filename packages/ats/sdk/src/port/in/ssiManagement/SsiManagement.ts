// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { QueryBus } from "@core/query/QueryBus";
import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import IsIssuerRequest from "../request/security/operations/issue/IsIssuerRequest";
import { IsIssuerQuery } from "@query/security/ssi/isIssuer/IsIssuerQuery";
import { AddIssuerCommand } from "@command/security/ssi/addIssuer/AddIssuerCommand";
import { SetRevocationRegistryAddressCommand } from "@command/security/ssi/setRevocationRegistryAddress/SetRevocationRegistryAddressCommand";
import { RemoveIssuerCommand } from "@command/security/ssi/removeIssuer/RemoveIssuerCommand";
import SetRevocationRegistryAddressRequest from "../request/security/ssi/SetRevocationRegistryAddressRequest";
import AddIssuerRequest from "../request/security/ssi/AddIssuerRequest";
import RemoveIssuerRequest from "../request/security/operations/issue/RemoveIssuerRequest";
import GetRevocationRegistryAddressRequest from "../request/security/ssi/GetRevocationRegistryAddressRequest";
import GetIssuerListCountRequest from "../request/security/ssi/GetIssuerListCountRequest";
import GetIssuerListMembersRequest from "../request/security/ssi/GetIssuerListMembersRequest";
import { GetRevocationRegistryAddressQuery } from "@query/security/ssi/getRevocationRegistryAddress/GetRevocationRegistryAddressQuery";
import { GetIssuerListCountQuery } from "@query/security/ssi/getIssuerListCount/GetIssuerListCountQuery";
import { GetIssuerListMembersQuery } from "@query/security/ssi/getIssuerListMembers/GetIssuerListMembersQuery";

interface ISsiManagementInPort {
  setRevocationRegistryAddress(
    request: SetRevocationRegistryAddressRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  addIssuer(request: AddIssuerRequest): Promise<{ payload: boolean; transactionId: string }>;
  removeIssuer(request: RemoveIssuerRequest): Promise<{ payload: boolean; transactionId: string }>;
  getRevocationRegistryAddress(request: GetRevocationRegistryAddressRequest): Promise<string>;
  getIssuerListCount(request: GetIssuerListCountRequest): Promise<number>;
  getIssuerListMembers(request: GetIssuerListMembersRequest): Promise<string[]>;
  isIssuer(request: IsIssuerRequest): Promise<boolean>;
}

class SsiManagementInPort implements ISsiManagementInPort {
  constructor(
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
  ) {}

  @LogError
  async addIssuer(request: AddIssuerRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, issuerId } = request;
    ValidatedRequest.handleValidation("AddIssuerRequest", request);

    return await this.commandBus.execute(new AddIssuerCommand(securityId, issuerId));
  }

  @LogError
  async setRevocationRegistryAddress(
    request: SetRevocationRegistryAddressRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, revocationRegistryId } = request;
    ValidatedRequest.handleValidation("SetRevocationRegistryAddressRequest", request);

    return await this.commandBus.execute(new SetRevocationRegistryAddressCommand(securityId, revocationRegistryId));
  }

  @LogError
  async removeIssuer(request: RemoveIssuerRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, issuerId } = request;
    ValidatedRequest.handleValidation("RemoveIssuerRequest", request);

    return await this.commandBus.execute(new RemoveIssuerCommand(securityId, issuerId));
  }

  @LogError
  async getRevocationRegistryAddress(request: GetRevocationRegistryAddressRequest): Promise<string> {
    const { securityId } = request;
    ValidatedRequest.handleValidation("GetRevocationRegistryAddressRequest", request);

    return (await this.queryBus.execute(new GetRevocationRegistryAddressQuery(securityId))).payload;
  }

  @LogError
  async getIssuerListCount(request: GetIssuerListCountRequest): Promise<number> {
    const { securityId } = request;
    ValidatedRequest.handleValidation("GetIssuerListCountRequest", request);

    return (await this.queryBus.execute(new GetIssuerListCountQuery(securityId))).payload;
  }

  @LogError
  async getIssuerListMembers(request: GetIssuerListMembersRequest): Promise<string[]> {
    const { securityId, start, end } = request;
    ValidatedRequest.handleValidation("GetIssuerListMembersRequest", request);

    return (await this.queryBus.execute(new GetIssuerListMembersQuery(securityId, start, end))).payload;
  }

  @LogError
  async isIssuer(request: IsIssuerRequest): Promise<boolean> {
    const { securityId, issuerId } = request;
    ValidatedRequest.handleValidation("IsIssuerRequest", request);

    return (await this.queryBus.execute(new IsIssuerQuery(securityId, issuerId))).payload;
  }
}

const SsiManagement = new SsiManagementInPort();
export default SsiManagement;
