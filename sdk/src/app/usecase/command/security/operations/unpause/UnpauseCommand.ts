import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';

export class UnpauseCommandResponse implements CommandResponse {
  constructor(public readonly payload: boolean) {}
}

export class UnpauseCommand extends Command<UnpauseCommandResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
