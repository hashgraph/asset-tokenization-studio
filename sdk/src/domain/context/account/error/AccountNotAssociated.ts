import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';

export class AccountNotAssociatedToSecurity extends BaseError {
  constructor(accountId: string, securityId: string) {
    super(
      ErrorCode.AccountNotAssociatedToSecurity,
      `Account ${accountId} is not associated to token ${securityId}`,
    );
  }
}
