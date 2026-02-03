// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface KycViewModel extends QueryResponse {
  validFrom: string;
  validTo: string;
  vcId: string;
  issuer: string;
  status: number;
}
