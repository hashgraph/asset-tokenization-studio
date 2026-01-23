// SPDX-License-Identifier: Apache-2.0

import { LogError } from "@core/decorator/LogErrorDecorator";
import {
  ControlListRequest,
  GetControlListCountRequest,
  GetControlListMembersRequest,
  GetControlListTypeRequest,
} from "../../request";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { AddToControlListCommand } from "@command/security/operations/addToControlList/AddToControlListCommand";
import { RemoveFromControlListCommand } from "@command/security/operations/removeFromControlList/RemoveFromControlListCommand";
import { IsInControlListQuery } from "@query/account/controlList/IsInControlListQuery";
import { GetControlListCountQuery } from "@query/security/controlList/getControlListCount/GetControlListCountQuery";
import { GetControlListMembersQuery } from "@query/security/controlList/getControlListMembers/GetControlListMembersQuery";
import { SecurityControlListType } from "../Security";
import { GetControlListTypeQuery } from "@query/security/controlList/getControlListType/GetControlListTypeQuery";
import { BaseSecurityInPort } from "../BaseSecurityInPort";

export interface ISecurityInPortControlList {
  addToControlList(request: ControlListRequest): Promise<{ payload: boolean; transactionId: string }>;
  removeFromControlList(request: ControlListRequest): Promise<{ payload: boolean; transactionId: string }>;
  isAccountInControlList(request: ControlListRequest): Promise<boolean>;
  getControlListCount(request: GetControlListCountRequest): Promise<number>;
  getControlListMembers(request: GetControlListMembersRequest): Promise<string[]>;
  getControlListType(request: GetControlListTypeRequest): Promise<SecurityControlListType>;
}

export class SecurityInPortControlList extends BaseSecurityInPort implements ISecurityInPortControlList {
  @LogError
  async addToControlList(request: ControlListRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, targetId } = request;
    ValidatedRequest.handleValidation("ControlListRequest", request);

    return await this.commandBus.execute(new AddToControlListCommand(targetId, securityId));
  }

  @LogError
  async removeFromControlList(request: ControlListRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, targetId } = request;
    ValidatedRequest.handleValidation("ControlListRequest", request);

    return await this.commandBus.execute(new RemoveFromControlListCommand(targetId, securityId));
  }

  @LogError
  async isAccountInControlList(request: ControlListRequest): Promise<boolean> {
    ValidatedRequest.handleValidation("ControlListRequest", request);

    return (await this.queryBus.execute(new IsInControlListQuery(request.securityId, request.targetId))).payload;
  }

  @LogError
  async getControlListCount(request: GetControlListCountRequest): Promise<number> {
    ValidatedRequest.handleValidation("GetControlListCountRequest", request);

    return (await this.queryBus.execute(new GetControlListCountQuery(request.securityId))).payload;
  }

  @LogError
  async getControlListMembers(request: GetControlListMembersRequest): Promise<string[]> {
    ValidatedRequest.handleValidation("GetControlListMembersRequest", request);

    const membersIds: string[] = [];

    const membersEvmAddresses = (
      await this.queryBus.execute(new GetControlListMembersQuery(request.securityId, request.start, request.end))
    ).payload;

    let mirrorAccount;

    for (let i = 0; i < membersEvmAddresses.length; i++) {
      mirrorAccount = await this.mirrorNode.getAccountInfo(membersEvmAddresses[i]);
      membersIds.push(mirrorAccount.id.toString());
    }

    return membersIds;
  }

  @LogError
  async getControlListType(request: GetControlListTypeRequest): Promise<SecurityControlListType> {
    ValidatedRequest.handleValidation("GetControlListTypeRequest", request);

    return (await this.queryBus.execute(new GetControlListTypeQuery(request.securityId))).payload;
  }
}
