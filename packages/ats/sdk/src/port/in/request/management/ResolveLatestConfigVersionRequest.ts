// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class ResolveLatestConfigVersionRequest extends ValidatedRequest<ResolveLatestConfigVersionRequest> {
  resolverAddress: string;
  configurationId: string;

  constructor({ resolverAddress, configurationId }: { resolverAddress: string; configurationId: string }) {
    super({
      resolverAddress: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      configurationId: FormatValidation.checkBytes32Format(),
    });
    this.resolverAddress = resolverAddress;
    this.configurationId = configurationId;
  }
}
