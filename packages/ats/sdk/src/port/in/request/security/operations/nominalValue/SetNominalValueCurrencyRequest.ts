// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";

export default class SetNominalValueCurrencyRequest extends ValidatedRequest<SetNominalValueCurrencyRequest> {
  securityId: string;
  nominalValueCurrency: string;

  constructor({ securityId, nominalValueCurrency }: { securityId: string; nominalValueCurrency: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      nominalValueCurrency: FormatValidation.checkBytes3Format(),
    });

    this.securityId = securityId;
    this.nominalValueCurrency = nominalValueCurrency;
  }
}
