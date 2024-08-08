import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class AccountInBlackList extends BaseError {
  constructor(account: string) {
    super(
      ErrorCode.AccountInBlackList,
      `The account ${account} is in black list`,
    );
  }
}
