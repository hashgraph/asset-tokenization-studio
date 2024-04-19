import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';

export class RedeemCommandResponse implements CommandResponse {
  constructor(public readonly payload: boolean) {}
}

export class RedeemCommand extends Command<RedeemCommandResponse> {
  constructor(
    public readonly amount: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
