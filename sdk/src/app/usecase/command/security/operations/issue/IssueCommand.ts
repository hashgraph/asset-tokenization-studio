import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class IssueCommandResponse implements CommandResponse {
  constructor(public readonly payload: boolean) {}
}

export class IssueCommand extends Command<IssueCommandResponse> {
  constructor(
    public readonly amount: string,
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
