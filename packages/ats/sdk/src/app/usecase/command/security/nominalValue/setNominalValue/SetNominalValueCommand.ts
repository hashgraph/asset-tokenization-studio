// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetNominalValueCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class SetNominalValueCommand extends Command<SetNominalValueCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly nominalValue: string,
    public readonly nominalValueDecimals: number,
  ) {
    super();
  }
}
