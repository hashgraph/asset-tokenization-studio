// SPDX-License-Identifier: Apache-2.0

/** Production public entry point: the Factory, a ResolverProxy on the factory configuration. */

import { getFactoryModule } from "../lib/builders";
import { PRODUCTION_MODE } from "../lib/shared";

export default getFactoryModule(PRODUCTION_MODE);
