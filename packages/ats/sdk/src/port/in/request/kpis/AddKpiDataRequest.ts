// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export class AddKpiDataRequest extends ValidatedRequest<AddKpiDataRequest> {
  securityId: string;
  date: number;
  value: string;
  project: string;

  constructor({
    securityId,
    date,
    value,
    project,
  }: {
    securityId: string;
    date: number;
    value: string;
    project: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      date: FormatValidation.checkNumber(),
      value: FormatValidation.checkString({ emptyCheck: true }),
      project: FormatValidation.checkEvmAddressFormat(),
    });
    this.securityId = securityId;
    this.date = date;
    this.value = value;
    this.project = project;
  }
}
