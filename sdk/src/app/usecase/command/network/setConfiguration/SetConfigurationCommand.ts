import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';

export class SetConfigurationCommandResponse implements CommandResponse {
  constructor(
    public readonly factoryAddress: string,
    public readonly resolverAddress: string,
    public readonly businessLogicKeysCommon: string[],
    public readonly businessLogicKeysEquity: string[],
    public readonly businessLogicKeysBond: string[],
  ) {}
}

export class SetConfigurationCommand extends Command<SetConfigurationCommandResponse> {
  constructor(
    public readonly factoryAddress: string,
    public readonly resolverAddress: string,
    public readonly businessLogicKeysCommon: string[],
    public readonly businessLogicKeysEquity: string[],
    public readonly businessLogicKeysBond: string[],
  ) {
    super();
  }
}
