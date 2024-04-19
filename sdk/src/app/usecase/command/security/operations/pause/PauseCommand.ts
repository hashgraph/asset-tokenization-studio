import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';

export class PauseCommandResponse implements CommandResponse {
  constructor(public readonly payload: boolean) {}
}

export class PauseCommand extends Command<PauseCommandResponse> {
  constructor(public readonly securityId: string) {
    super();
  }
}
