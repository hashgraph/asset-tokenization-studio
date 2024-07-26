import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { SecurityRole } from '../../../../../../domain/context/security/SecurityRole.js';

export class GrantRoleCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class GrantRoleCommand extends Command<GrantRoleCommandResponse> {
  constructor(
    public readonly role: SecurityRole,
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
