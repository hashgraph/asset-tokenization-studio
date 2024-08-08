import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';

export class AccountNotInWhiteList extends BaseError {
  constructor(account: string) {
    super(
      ErrorCode.AccountNotInWhiteList,
      `The account ${account} is not in white list`,
    );
  }
}
