// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import { BigNumber } from "ethers";

export default class IsCheckPointDateRequest extends ValidatedRequest<IsCheckPointDateRequest> {
  securityId: string;
  date: BigNumber;
  project: string;

  constructor({ securityId, date, project }: { securityId: string; date: BigNumber; project: string }) {
    super({});
    this.securityId = securityId;
    this.date = date;
    this.project = project;
  }
}
