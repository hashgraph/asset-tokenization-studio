// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetRevocationRegistryAddressCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class SetRevocationRegistryAddressCommand extends Command<SetRevocationRegistryAddressCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly revocationRegistryId: string,
  ) {
    super();
  }
}
