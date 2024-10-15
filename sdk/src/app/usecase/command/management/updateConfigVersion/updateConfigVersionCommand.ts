import {Command} from "../../../../../core/command/Command";

export class UpdateConfigVersionCommand {
  constructor(
     public readonly configVersion: string,
     public readonly securityId: string
  ) {}
}

export class UpdateConfigVersionCommand extends Command<UpdateConfigVersionCommand> {
  constructor(
     public readonly configVersion: string,
     public readonly securityId: string
  ) {
    super();
  }
}