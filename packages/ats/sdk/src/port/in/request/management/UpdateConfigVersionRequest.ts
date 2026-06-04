// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";
import { MIN_CONFIG_VERSION } from "@core/Constants";

export default class UpdateConfigVersionRequest extends ValidatedRequest<UpdateConfigVersionRequest> {
  configVersion: number;
  securityId: string;

  constructor({ configVersion, securityId }: { configVersion: number; securityId: string }) {
    super({
      configVersion: FormatValidation.checkNumber({ min: MIN_CONFIG_VERSION }),
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.configVersion = configVersion;
    this.securityId = securityId;
  }
}
