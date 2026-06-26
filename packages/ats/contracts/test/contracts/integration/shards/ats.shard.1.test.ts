// SPDX-License-Identifier: Apache-2.0

/**
 * Parallel shard 1/8 of the ATS mega-asset suites — see ../atsShardRunner. Used by
 * `npm run test:parallel:ats`; mocha --parallel runs each shard file in its own worker.
 */

import { runAtsShard } from "../atsShardRunner";

runAtsShard(0, 8);
