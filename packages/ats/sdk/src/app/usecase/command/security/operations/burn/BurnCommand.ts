// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";
import { HederaId } from "@domain/context/shared/HederaId";

export class BurnCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class BurnCommand extends Command<BurnCommandResponse> {
  constructor(
    public readonly sourceId: string,
    public readonly amount: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
