import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';

export class TransferAndLockCommandResponse implements CommandResponse {
  constructor(public readonly payload: boolean) {}
}

export class TransferAndLockCommand extends Command<TransferAndLockCommandResponse> {
  constructor(
    public readonly amount: string,
    public readonly targetId: string,
    public readonly securityId: string,
    public readonly expirationDate: string,
  ) {
    super();
  }
}
