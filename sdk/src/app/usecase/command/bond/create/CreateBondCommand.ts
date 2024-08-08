import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';
import ContractId from '../../../../../domain/context/contract/ContractId.js';
import { SecurityProps } from '../../../../../domain/context/security/Security.js';

export class CreateBondCommandResponse implements CommandResponse {
  public readonly securityId: ContractId;
  public readonly transactionId: string;

  constructor(securityId: ContractId, transactionId: string) {
    this.securityId = securityId;
    this.transactionId = transactionId;
  }
}

export class CreateBondCommand extends Command<CreateBondCommandResponse> {
  constructor(
    public readonly security: SecurityProps,
    public readonly currency: string,
    public readonly nominalValue: string,
    public readonly startingDate: string,
    public readonly maturityDate: string,
    public readonly couponFrequency: string,
    public readonly couponRate: string,
    public readonly firstCouponDate: string,
    public readonly factory?: ContractId,
    public readonly resolver?: ContractId,
    public readonly businessLogicKeys?: string[],
    public readonly diamondOwnerAccount?: string,
  ) {
    super();
  }
}
