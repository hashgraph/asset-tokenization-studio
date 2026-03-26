// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class SetNominalValueRequest extends ValidatedRequest<SetNominalValueRequest> {
  securityId: string;
  nominalValue: string;
  nominalValueDecimals: number;

  constructor({
    securityId,
    nominalValue,
    nominalValueDecimals,
  }: {
    securityId: string;
    nominalValue: string;
    nominalValueDecimals: number;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      nominalValue: FormatValidation.checkString({ emptyCheck: true }),
      nominalValueDecimals: FormatValidation.checkNumber({ min: 0, max: 255 }),
    });

    this.securityId = securityId;
    this.nominalValue = nominalValue;
    this.nominalValueDecimals = nominalValueDecimals;
  }
}
