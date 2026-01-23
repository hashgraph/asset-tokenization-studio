// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";
import { HederaId } from "@domain/context/shared/HederaId";

export class RemoveFromControlListCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class RemoveFromControlListCommand extends Command<RemoveFromControlListCommandResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
