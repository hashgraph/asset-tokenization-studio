// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetEquityDetailsRequest extends ValidatedRequest<GetEquityDetailsRequest> {
  equityId: string;

  constructor({ equityId }: { equityId: string }) {
    super({
      equityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.equityId = equityId;
  }
}
