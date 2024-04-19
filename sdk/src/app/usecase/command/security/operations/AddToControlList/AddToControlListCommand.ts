import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class AddToControlListCommandResponse implements CommandResponse {
  constructor(public readonly payload: boolean) {}
}

export class AddToControlListCommand extends Command<AddToControlListCommandResponse> {
  constructor(
    public readonly targetId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
