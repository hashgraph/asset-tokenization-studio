import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';

export class ReleaseCommandResponse implements CommandResponse {
  constructor(public readonly payload: boolean) {}
}

export class ReleaseCommand extends Command<ReleaseCommandResponse> {
  constructor(
    public readonly lockId: number,
    public readonly sourceId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
