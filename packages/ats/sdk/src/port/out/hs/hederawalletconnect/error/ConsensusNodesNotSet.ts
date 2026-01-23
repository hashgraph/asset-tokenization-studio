// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from '@core/error/BaseError';

export class ConsensusNodesNotSet extends BaseError {
  constructor() {
    super(
      ErrorCode.ConsensusNodesNotSet,
      `❌ In order to create sign multisignature transactions you must set consensus nodes for the environment`,
    );
  }
}
