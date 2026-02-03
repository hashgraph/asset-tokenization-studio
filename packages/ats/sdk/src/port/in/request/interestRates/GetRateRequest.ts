// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class GetRateRequest extends ValidatedRequest<GetRateRequest> {
  securityId: string;

  constructor({ securityId }: { securityId: string }) {
    super({});
    this.securityId = securityId;
  }
}
