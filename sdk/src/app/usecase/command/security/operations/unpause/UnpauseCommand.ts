import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';

export class UnpauseCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class UnpauseCommand extends Command<UnpauseCommandResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
