// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { QueryBus } from "@core/query/QueryBus";
import Injectable from "@core/injectable/Injectable";
import { CommandBus } from "@core/command/CommandBus";
import { ActionContentHashExistsQuery } from "@query/security/actionContentHashExists/ActionContentHashExistsQuery";
import { ActionContentHashExistsRequest } from "../../request";

interface ICorporateActionsInPort {
  actionContentHashExists(request: ActionContentHashExistsRequest): Promise<boolean>;
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
}

const CorporateActions = new CorporateActionsInPort();
export default CorporateActions;
