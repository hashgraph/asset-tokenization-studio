// SPDX-License-Identifier: Apache-2.0

/** Production governance core: ProxyAdmin + BLR behind a TransparentUpgradeableProxy. */

import { getBlrModule } from "../lib/builders";
import { PRODUCTION_MODE } from "../lib/shared";

export default getBlrModule(PRODUCTION_MODE);
