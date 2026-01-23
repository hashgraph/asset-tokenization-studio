// SPDX-License-Identifier: Apache-2.0

import ContractId from "@domain/context/contract/ContractId";
import { Command } from "@core/command/Command";
import { CommandResponse } from "@core/command/CommandResponse";

export class UpdateResolverCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class UpdateResolverCommand extends Command<UpdateResolverCommandResponse> {
  constructor(
    public readonly configVersion: number,
    public readonly securityId: string,
    public readonly configId: string,
    public readonly resolver: ContractId,
  ) {
    super();
  }
}
