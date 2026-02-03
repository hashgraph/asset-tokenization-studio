// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

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
      configVersion: FormatValidation.checkNumber(),
      configId: FormatValidation.checkBytes32Format(),
      resolver: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.configVersion = configVersion;
    this.configId = configId;
    this.securityId = securityId;
    this.resolver = resolver;
  }
}
