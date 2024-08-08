import { SecurityRole } from '../../../domain/context/security/SecurityRole.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetRoleMemberCountRequest extends ValidatedRequest<GetRoleMemberCountRequest> {
  securityId: string;
  role: SecurityRole | undefined;

  constructor({
    securityId,
    role,
  }: {
    securityId: string;
    role: SecurityRole | undefined;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      role: Validation.checkRole(),
    });
    this.securityId = securityId;
    this.role = role;
  }
}
