import { Command } from '../../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../../core/command/CommandResponse.js';

export class SetCouponCommandResponse implements CommandResponse {
  constructor(
    public readonly payload: number,
    public readonly transactionId: string,
  ) {}
}

export class SetCouponCommand extends Command<SetCouponCommandResponse> {
  constructor(
    public readonly address: string,
    public readonly recordDate: string,
    public readonly executionDate: string,
    public readonly rate: string,
  ) {
    super();
  }
}
