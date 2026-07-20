// SPDX-License-Identifier: Apache-2.0

/** Production facet catalog: deploy every facet and register it in the BLR. */

import { getFacetsModule } from "../lib/builders";
import { PRODUCTION_MODE } from "../lib/shared";

export default getFacetsModule(PRODUCTION_MODE);
