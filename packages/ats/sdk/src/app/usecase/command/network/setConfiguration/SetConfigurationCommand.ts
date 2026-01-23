// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetConfigurationCommandResponse implements CommandResponse {
  constructor(
    public readonly factoryAddress: string,
    public readonly resolverAddress: string,
  ) {}
}

export class SetConfigurationCommand extends Command<SetConfigurationCommandResponse> {
  constructor(
    public readonly factoryAddress: string,
    public readonly resolverAddress: string,
  ) {
    super();
  }
}
