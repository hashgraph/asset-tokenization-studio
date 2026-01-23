// SPDX-License-Identifier: Apache-2.0

import { InvalidValue } from "../../../error/InvalidValue";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "../../../FormatValidation";

export default class BatchTransferRequest extends ValidatedRequest<BatchTransferRequest> {
  securityId: string;
  amountList: string[];
  toList: string[];

  constructor({ securityId, amountList, toList }: { securityId: string; amountList: string[]; toList: string[] }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amountList: (vals) =>
        vals.length !== toList.length
          ? [new InvalidValue(`The list of toList and amountList must have equal length.`)]
          : [],
      toList: (vals) => FormatValidation.checkHederaIdOrEvmAddressArray(vals, "toList"),
    });
    this.securityId = securityId;
    this.amountList = amountList;
    this.toList = toList;
  }
}
