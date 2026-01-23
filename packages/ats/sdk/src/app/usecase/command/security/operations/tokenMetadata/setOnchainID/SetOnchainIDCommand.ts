// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetOnchainIDCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class SetOnchainIDCommand extends Command<SetOnchainIDCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly onchainID: string,
  ) {
    super();
  }
}
