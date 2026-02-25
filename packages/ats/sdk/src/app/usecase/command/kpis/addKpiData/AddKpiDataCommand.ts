// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";

export class AddKpiDataCommand extends Command<AddKpiDataCommandResponse> {
  constructor(
    public readonly securityId: string,
    public readonly date: number,
    public readonly value: string,
    public readonly project: string,
  ) {
    super();
  }
}

export class AddKpiDataCommandResponse {
  constructor(public readonly transactionId: string) {}
}
