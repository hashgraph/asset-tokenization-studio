import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';

export class SetDividendsCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class SetDividendsCommand extends Command<SetDividendsCommandResponse> {
  constructor(
    public readonly address: string,
    public readonly recordDate: string,
    public readonly executionDate: string,
    public readonly amount: string,
  ) {
    super();
  }
}
