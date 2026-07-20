// SPDX-License-Identifier: Apache-2.0

/**
 * Full-system production deployment. Module bodies live in
 * `ignition/lib/builders.ts`, parameterized by mode; the test variant is
 * `AtsTimeTravelSystem.ts`. Render the module tree with
 * `npx hardhat ignition visualize ignition/modules/AtsSystem.ts`.
 */

import { getSystemModule } from "../lib/builders";
import { PRODUCTION_MODE } from "../lib/shared";

export default getSystemModule(PRODUCTION_MODE);
