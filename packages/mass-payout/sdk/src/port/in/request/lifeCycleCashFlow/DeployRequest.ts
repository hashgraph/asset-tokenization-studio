// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "@port/in/request/FormatValidation";
import RbacRequest from "./RbacRequest";

export default class DeployRequest extends ValidatedRequest<DeployRequest> {
  asset: string;
  paymentToken: string;
  rbac: RbacRequest[];

  constructor({
    asset,
    paymentToken,
    rbac = [],
  }: {
    asset: string;
    paymentToken: string;
    rbac?: { role: string; members: string[] }[];
  }) {
    super({
      asset: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      paymentToken: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      rbac: FormatValidation.checkRbacEntry(),
    });

    this.asset = asset;
    this.paymentToken = paymentToken;
    this.rbac = rbac.map((entry) => new RbacRequest(entry));
  }
}
