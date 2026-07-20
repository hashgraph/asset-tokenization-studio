// SPDX-License-Identifier: Apache-2.0

/** Production orchestrator libraries, deployed standalone and linked into facets. */

import { getLibrariesModule } from "../lib/builders";
import { PRODUCTION_MODE } from "../lib/shared";

export default getLibrariesModule(PRODUCTION_MODE);
