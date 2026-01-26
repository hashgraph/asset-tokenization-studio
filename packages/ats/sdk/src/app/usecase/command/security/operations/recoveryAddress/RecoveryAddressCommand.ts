// SPDX-License-Identifier: Apache-2.0

import { CommandResponse } from "@core/command/CommandResponse";
import { Command } from "@core/command/Command";

export class RecoveryAddressCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class RecoveryAddressCommand extends Command<RecoveryAddressCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly lostWalletId: string,
    public readonly newWalletId: string,
  ) {
    super();
  }
}
