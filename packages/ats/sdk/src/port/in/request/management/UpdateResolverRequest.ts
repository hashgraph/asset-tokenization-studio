// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";
import { MIN_CONFIG_VERSION } from "@core/Constants";

export default class UpdateResolverRequest extends ValidatedRequest<UpdateResolverRequest> {
  securityId: string;
  configVersion: number;
  configId: string;
  resolver: string;

  constructor({
    configVersion,
    configId,
    securityId,
    resolver,
  }: {
    configVersion: number;
    configId: string;
    securityId: string;
    resolver: string;
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      configVersion: FormatValidation.checkNumber({ min: MIN_CONFIG_VERSION }),
      configId: FormatValidation.checkBytes32Format(),
      resolver: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.configVersion = configVersion;
    this.configId = configId;
    this.securityId = securityId;
    this.resolver = resolver;
  }
}
