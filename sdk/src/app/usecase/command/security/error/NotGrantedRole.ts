import BaseError, { ErrorCode } from '../../../../../core/error/BaseError.js';
import { SecurityRole } from '../../../../../domain/context/security/SecurityRole.js';

export class NotGrantedRole extends BaseError {
  constructor(role: SecurityRole) {
    super(
      ErrorCode.RoleNotAssigned,
      `The account trying to perform the operation doesn't have the needed role (${role})`,
    );
  }
}
