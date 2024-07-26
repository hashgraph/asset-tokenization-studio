import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';

export class SetVotingRightsCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class SetVotingRightsCommand extends Command<SetVotingRightsCommandResponse> {
  constructor(
    public readonly address: string,
    public readonly recordDate: string,
    public readonly data: string,
  ) {
    super();
  }
}
