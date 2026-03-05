// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface GetCorporateActionsResponse extends QueryResponse {
  actionTypes: string[];
  actionTypeIds: number[];
  datas: string[];
  isDisabled: boolean[];
}
