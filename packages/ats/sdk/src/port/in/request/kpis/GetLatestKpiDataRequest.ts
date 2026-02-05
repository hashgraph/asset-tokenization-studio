// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import { BigNumber } from "ethers";

export default class GetLatestKpiDataRequest extends ValidatedRequest<GetLatestKpiDataRequest> {
  securityId: string;
  from: BigNumber;
  to: BigNumber;

  constructor({ securityId, from, to }: { securityId: string; from: BigNumber; to: BigNumber }) {
    super({});
    this.securityId = securityId;
    this.from = from;
    this.to = to;
  }
}
