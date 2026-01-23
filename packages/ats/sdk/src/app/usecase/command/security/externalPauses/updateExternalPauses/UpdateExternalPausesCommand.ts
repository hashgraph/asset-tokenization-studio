// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class UpdateExternalPausesCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class UpdateExternalPausesCommand extends Command<UpdateExternalPausesCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly externalPausesAddresses: string[],
    public readonly actives: boolean[],
  ) {
    super();
  }
}
