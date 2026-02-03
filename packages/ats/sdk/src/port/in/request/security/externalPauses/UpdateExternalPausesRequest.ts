// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";
import { InvalidValue } from "../../error/InvalidValue";

export default class UpdateExternalPausesRequest extends ValidatedRequest<UpdateExternalPausesRequest> {
  securityId: string;
  externalPausesAddresses: string[];
  actives: boolean[];

  constructor({
    securityId,
    externalPausesAddresses,
    actives,
  }: {
    securityId: string;
    externalPausesAddresses: string[];
    actives: boolean[];
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      externalPausesAddresses: (vals) =>
        FormatValidation.checkHederaIdOrEvmAddressArray(vals, "externalPausesAddresses"),
      actives: (vals) =>
        vals.length !== externalPausesAddresses.length
          ? [new InvalidValue(`The list of externalPausesAddresses and actives must have equal length.`)]
          : [],
    });

    this.securityId = securityId;
    this.externalPausesAddresses = externalPausesAddresses;
    this.actives = actives;
  }
}
