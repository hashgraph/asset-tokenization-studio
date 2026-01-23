// SPDX-License-Identifier: Apache-2.0

import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class TakeSnapshotCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class TakeSnapshotCommand extends Command<TakeSnapshotCommandResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
