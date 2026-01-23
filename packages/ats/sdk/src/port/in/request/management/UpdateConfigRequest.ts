// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class UpdateConfigRequest extends ValidatedRequest<UpdateConfigRequest> {
  configId: string;
  configVersion: number;
  securityId: string;

  constructor({
    configId,
    configVersion,
    securityId,
  }: {
    configId: string;
    configVersion: number;
    securityId: string;
  }) {
    super({
      configId: FormatValidation.checkBytes32Format(),
      configVersion: FormatValidation.checkNumber(),
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.configId = configId;
    this.configVersion = configVersion;
    this.securityId = securityId;
  }
}
