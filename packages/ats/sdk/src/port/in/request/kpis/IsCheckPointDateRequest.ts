// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class IsCheckPointDateRequest extends ValidatedRequest<IsCheckPointDateRequest> {
  securityId: string;
  date: number;
  project: string;

  constructor({ securityId, date, project }: { securityId: string; date: number; project: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      date: FormatValidation.checkNumber({ min: 0 }),
      project: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });
    this.securityId = securityId;
    this.date = date;
    this.project = project;
  }
}
