// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { QueryBus } from "@core/query/QueryBus";
import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import { ActionContentHashExistsQuery } from "@query/security/actionContentHashExists/ActionContentHashExistsQuery";
import { GetCorporateActionQuery } from "@query/security/getCorporateAction/GetCorporateActionQuery";
import { GetCorporateActionsQuery } from "@query/security/getCorporateActions/GetCorporateActionsQuery";
import { GetCorporateActionsByTypeQuery } from "@query/security/getCorporateActionsByType/GetCorporateActionsByTypeQuery";
import {
  ActionContentHashExistsRequest,
  GetCorporateActionRequest,
  GetCorporateActionsRequest,
  GetCorporateActionsByTypeRequest,
} from "../../request";
import GetCorporateActionResponse from "../../response/corporateActions/GetCorporateActionResponse";
import GetCorporateActionsResponse from "../../response/corporateActions/GetCorporateActionsResponse";

interface ICorporateActionsInPort {
  actionContentHashExists(request: ActionContentHashExistsRequest): Promise<boolean>;
  getCorporateAction(request: GetCorporateActionRequest): Promise<GetCorporateActionResponse>;
  getCorporateActions(request: GetCorporateActionsRequest): Promise<GetCorporateActionsResponse>;
  getCorporateActionsByType(request: GetCorporateActionsByTypeRequest): Promise<GetCorporateActionsResponse>;
}

class CorporateActionsInPort implements ICorporateActionsInPort {
  constructor(
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
  ) {}

  @LogError
  async actionContentHashExists(request: ActionContentHashExistsRequest): Promise<boolean> {
    const { securityId, contentHash } = request;
    ValidatedRequest.handleValidation("ActionContentHashExistsRequest", request);

    return (await this.queryBus.execute(new ActionContentHashExistsQuery(securityId, contentHash))).payload;
  }

  @LogError
  async getCorporateAction(request: GetCorporateActionRequest): Promise<GetCorporateActionResponse> {
    ValidatedRequest.handleValidation("GetCorporateActionRequest", request);

    const res = await this.queryBus.execute(new GetCorporateActionQuery(request.securityId, request.corporateActionId));

    return res.payload;
  }

  @LogError
  async getCorporateActions(request: GetCorporateActionsRequest): Promise<GetCorporateActionsResponse> {
    ValidatedRequest.handleValidation("GetCorporateActionsRequest", request);

    const res = await this.queryBus.execute(
      new GetCorporateActionsQuery(request.securityId, request.pageIndex, request.pageLength),
    );

    return res.payload;
  }

  @LogError
  async getCorporateActionsByType(request: GetCorporateActionsByTypeRequest): Promise<GetCorporateActionsResponse> {
    ValidatedRequest.handleValidation("GetCorporateActionsByTypeRequest", request);

    const res = await this.queryBus.execute(
      new GetCorporateActionsByTypeQuery(request.securityId, request.actionType, request.pageIndex, request.pageLength),
    );

    return res.payload;
  }
}

const CorporateActions = new CorporateActionsInPort();
export default CorporateActions;
