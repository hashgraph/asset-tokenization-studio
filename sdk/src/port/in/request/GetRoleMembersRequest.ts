import { SecurityRole } from '../../../domain/context/security/SecurityRole.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetRoleMembersRequest extends ValidatedRequest<GetRoleMembersRequest> {
  securityId: string;
  role: SecurityRole | undefined;
  start: number;
  end: number;

  constructor({
    securityId,
    role,
    start,
    end,
  }: {
    securityId: string;
    role: SecurityRole | undefined;
    start: number;
    end: number;
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      role: Validation.checkRole(),
    });
    this.securityId = securityId;
    this.role = role;
    this.start = start;
    this.end = end;
  }
}
