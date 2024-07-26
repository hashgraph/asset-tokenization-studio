import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';
import { HederaId } from '../../../../../../domain/context/shared/HederaId.js';

export class ControllerRedeemCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: boolean,
    public readonly transactionId: string,
  ) {}
}

export class ControllerRedeemCommand extends Command<ControllerRedeemCommandResponse> {
  constructor(
    public readonly amount: string,
    public readonly sourceId: string,
    public readonly securityId: string,
  ) {
    super();
  }
}
