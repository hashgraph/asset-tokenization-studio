import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { SecurityRole } from '../../../../../../domain/context/security/SecurityRole.js';

export class RevokeRoleCommandResponse implements CommandResponse {
  constructor(public readonly payload: boolean) {}
}

export class RevokeRoleCommand extends Command<RevokeRoleCommandResponse> {
  constructor(
    public readonly role: SecurityRole,
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
