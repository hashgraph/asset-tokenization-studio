import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';

export class SetMaxSupplyCommandResponse implements CommandResponse {
  constructor(public readonly payload: boolean) {}
}

export class SetMaxSupplyCommand extends Command<SetMaxSupplyCommandResponse> {
  constructor(
    public readonly maxSupply: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
