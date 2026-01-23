// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";
import { HederaId } from "@domain/context/shared/HederaId";

export class ForcedTransferCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ForcedTransferCommand extends Command<ForcedTransferCommandResponse> {
  constructor(
    public readonly sourceId: string,
    public readonly targetId: string,
    public readonly amount: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
