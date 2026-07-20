// SPDX-License-Identifier: Apache-2.0

/**
 * Full-system TEST deployment (what the integration fixture deploys): adds
 * TimeTravelFacet and the mocks, swaps DiamondFacet/FactoryFacet for their
 * mock counterparts in the configurations, and includes the InitializeMock
 * domain. Separate module ids ("TimeTravel" suffix) keep its journal apart
 * from production.
 */

import { getSystemModule } from "../lib/builders";
import { TIMETRAVEL_MODE } from "../lib/shared";

export default getSystemModule(TIMETRAVEL_MODE);
