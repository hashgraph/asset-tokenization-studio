/* eslint-disable @typescript-eslint/no-explicit-any */
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import { SecurityRole } from '../../../domain/context/security/SecurityRole.js';
import { InvalidValue } from './error/InvalidValue.js';

export default class ApplyRolesRequest extends ValidatedRequest<ApplyRolesRequest> {
  securityId: string;
  targetId: string;
  roles: SecurityRole[];
  actives: boolean[];

  constructor({
    targetId,
    securityId,
    roles,
    actives,
  }: {
    targetId: string;
    securityId: string;
    roles: SecurityRole[];
    actives: boolean[];
  }) {
    super({
      securityId: Validation.checkHederaIdFormatOrEvmAddress(),
      targetId: Validation.checkHederaIdFormatOrEvmAddress(),
      roles: (vals) => {
        if (vals.length == 0) {
          return [new InvalidValue(`The list of roles cannot be empty.`)];
        }

        for (let i = 0; i < vals.length; i++) {
          const err = Validation.checkRole()(vals[i]);
          if (err.length > 0) {
            return err;
          }
          if (vals.indexOf(vals[i]) != i) {
            return [new InvalidValue(`role ${vals[i]} is duplicated`)];
          }
        }
      },
      actives: (vals) => {
        if (vals.length != this.roles.length) {
          return [
            new InvalidValue(
              `The list of roles and actives must have equal length.`,
            ),
          ];
        }
      },
    });
    this.securityId = securityId;
    this.targetId = targetId;
    this.roles = roles;
    this.actives = actives;
  }
}
