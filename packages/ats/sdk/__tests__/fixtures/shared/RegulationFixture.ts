// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { Regulation } from "@domain/context/factory/Regulation";

export const RegulationFixture = createFixture<Regulation>((props) => {
  props.type.faker((faker) => faker.lorem.sentence());
  props.subType.faker((faker) => faker.lorem.sentence());
  props.dealSize.faker((faker) => faker.lorem.sentence());
  props.accreditedInvestors.faker((faker) => faker.lorem.sentence());
  props.maxNonAccreditedInvestors.faker((faker) => faker.number.int({ min: 0, max: 10 }));
  props.manualInvestorVerification.faker((faker) => faker.lorem.sentence());
  props.internationalInvestors.faker((faker) => faker.lorem.sentence());
  props.resaleHoldPeriod.faker((faker) => faker.lorem.sentence());
});
