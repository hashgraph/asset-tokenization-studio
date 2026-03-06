// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface GetCorporateActionResponse extends QueryResponse {
  actionType: string;
  actionTypeId: number;
  data: string;
  isDisabled: boolean;
}
