// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface PrincipalForViewModel extends QueryResponse {
  numerator: string;
  denominator: string;
}
