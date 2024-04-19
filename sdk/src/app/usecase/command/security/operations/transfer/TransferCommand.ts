import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';

export class TransferCommandResponse implements CommandResponse {
  constructor(public readonly payload: boolean) {}
}

export class TransferCommand extends Command<TransferCommandResponse> {
  constructor(
    public readonly amount: string,
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
