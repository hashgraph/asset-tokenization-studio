import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { SecurityRole } from '../../../../../../domain/context/security/SecurityRole.js';

export class ApplyRolesCommandResponse implements CommandResponse {
  constructor(public readonly payload: boolean) {}
}

export class ApplyRolesCommand extends Command<ApplyRolesCommandResponse> {
  constructor(
    public readonly roles: SecurityRole[],
    public readonly actives: boolean[],
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
