// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class GetImpactDataRequest extends ValidatedRequest<GetImpactDataRequest> {
  public readonly securityId: string;

  constructor({ securityId }: { securityId: string }) {
    super({});
    this.securityId = securityId;
  }
}
