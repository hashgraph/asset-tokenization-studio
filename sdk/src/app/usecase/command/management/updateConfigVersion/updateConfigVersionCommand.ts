import {Command} from "../../../../../core/command/Command";
import {CommandResponse} from "../../../../../core/command/CommandResponse";

export class UpdateConfigVersionCommandResponse implements CommandResponse{
  constructor(
      public readonly payload: boolean,
      public readonly transactionId: string,
  ) {}
}

export class UpdateConfigVersionCommand extends Command<UpdateConfigVersionCommandResponse> {
  constructor(
     public readonly configVersion: string,
     public readonly securityId: string
  ) {
    super();
  }
}