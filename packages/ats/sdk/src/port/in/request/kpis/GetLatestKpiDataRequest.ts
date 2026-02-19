// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetLatestKpiDataRequest extends ValidatedRequest<GetLatestKpiDataRequest> {
  securityId: string;
  from: string;
  to: string;
  kpi: string;

  constructor({ securityId, from, to, kpi }: { securityId: string; from: string; to: string; kpi: string }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      from: FormatValidation.checkNumber({ min: 0 }),
      to: FormatValidation.checkNumber({ min: 0 }),
      kpi: FormatValidation.checkString({ emptyCheck: true }),
    });
    this.securityId = securityId;
    this.from = from;
    this.to = to;
    this.kpi = kpi;
  }
}
