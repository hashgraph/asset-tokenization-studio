// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class SetNominalValueCurrencyCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class SetNominalValueCurrencyCommand extends Command<SetNominalValueCurrencyCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly nominalValueCurrency: string,
  ) {
    super();
  }
}
