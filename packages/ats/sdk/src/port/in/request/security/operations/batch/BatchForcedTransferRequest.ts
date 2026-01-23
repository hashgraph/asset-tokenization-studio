// SPDX-License-Identifier: Apache-2.0

import { InvalidValue } from "../../../error/InvalidValue";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "../../../FormatValidation";

export default class BatchForcedTransferRequest extends ValidatedRequest<BatchForcedTransferRequest> {
  securityId: string;
  amountList: string[];
  fromList: string[];
  toList: string[];

  constructor({
    securityId,
    amountList,
    fromList,
    toList,
  }: {
    securityId: string;
    amountList: string[];
    fromList: string[];
    toList: string[];
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amountList: (vals) =>
        vals.length !== fromList.length || vals.length !== toList.length
          ? [new InvalidValue(`The list of amountList, fromList and toList must have equal length.`)]
          : [],
      fromList: (vals) => FormatValidation.checkHederaIdOrEvmAddressArray(vals, "fromList"),
      toList: (vals) => FormatValidation.checkHederaIdOrEvmAddressArray(vals, "toList"),
    });
    this.securityId = securityId;
    this.amountList = amountList;
    this.fromList = fromList;
    this.toList = toList;
  }
}
