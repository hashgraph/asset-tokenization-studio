import { Command } from '../../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../../core/command/CommandResponse.js';

export class FreezePartialTokensResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class FreezePartialTokensCommand extends Command<FreezePartialTokensResponse> {
  constructor(
    public readonly securityId: string,
    public readonly amount: string,
    public readonly targetId: string,
  ) {
    super();
  }
}
