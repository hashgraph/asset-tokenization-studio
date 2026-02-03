// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetBondDetailsRequest extends ValidatedRequest<GetBondDetailsRequest> {
  bondId: string;

  constructor({ bondId }: { bondId: string }) {
    super({
      bondId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
    });

    this.bondId = bondId;
  }
}
