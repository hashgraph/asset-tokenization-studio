// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class UpdateConfigCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class UpdateConfigCommand extends Command<UpdateConfigCommandResponse> {
  constructor(
    public readonly configId: string,
    public readonly configVersion: number,
    public readonly securityId: string,
  ) {
    super();
  }
}
