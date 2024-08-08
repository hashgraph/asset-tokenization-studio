/* eslint-disable @typescript-eslint/no-explicit-any */
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import { SecurityRole } from '../../../domain/context/security/SecurityRole.js';

export default class RoleRequest extends ValidatedRequest<RoleRequest> {
  securityId: string;
  targetId: string;
  role: SecurityRole | undefined;

  constructor({
    targetId,
    securityId,
    role,
  }: {
    targetId: string;
    securityId: string;
    role: SecurityRole | undefined;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
      role: Validation.checkRole(),
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.role = role;
  }
}
