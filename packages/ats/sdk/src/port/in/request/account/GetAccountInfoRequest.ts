// SPDX-License-Identifier: Apache-2.0

import { AccountBaseRequest, RequestAccount } from "../BaseRequest";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../FormatValidation";

export default class GetAccountInfoRequest
  extends ValidatedRequest<GetAccountInfoRequest>
  implements AccountBaseRequest
{
  account: RequestAccount;

  constructor({ account }: { account: RequestAccount }) {
    super({
      account: FormatValidation.checkAccount(),
    });
    this.account = account;
  }
}
