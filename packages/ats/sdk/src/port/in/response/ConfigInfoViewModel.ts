// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";

export default interface ConfigInfoViewModel extends QueryResponse {
  resolverAddress: string;
  configId: string;
  configVersion: number;
}
