import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class AccountNotInControlList extends BaseError {
  constructor(account: string) {
    super(
      ErrorCode.AccountNotInControlList,
      `The account ${account} is not in the control list`,
    );
  }
}
