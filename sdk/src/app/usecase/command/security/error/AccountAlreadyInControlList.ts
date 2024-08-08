import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class AccountAlreadyInControlList extends BaseError {
  constructor(account: string) {
    super(
      ErrorCode.AccountAlreadyInControlList,
      `The account ${account} is already in the control list`,
    );
  }
}
