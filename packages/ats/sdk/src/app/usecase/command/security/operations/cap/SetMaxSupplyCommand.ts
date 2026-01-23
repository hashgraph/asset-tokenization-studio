// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetMaxSupplyCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class SetMaxSupplyCommand extends Command<SetMaxSupplyCommandResponse> {
  constructor(
    public readonly maxSupply: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
