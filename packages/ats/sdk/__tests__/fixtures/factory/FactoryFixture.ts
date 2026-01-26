// SPDX-License-Identifier: Apache-2.0

import GetRegulationDetailsRequest from "@port/in/request/factory/GetRegulationDetailsRequest";
import { createFixture } from "../config";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "@domain/context/factory/RegulationType";
import { faker } from "@faker-js/faker/.";

export const GetRegulationDetailsRequestFixture = createFixture<GetRegulationDetailsRequest>((request) => {
  const regulationType = CastRegulationType.toNumber(
    faker.helpers.arrayElement(Object.values(RegulationType).filter((type) => type !== RegulationType.NONE)),
  );
  request.regulationType?.as(() => regulationType);
  request.regulationSubType?.faker((faker) =>
    regulationType === CastRegulationType.toNumber(RegulationType.REG_S)
      ? CastRegulationSubType.toNumber(RegulationSubType.NONE)
      : CastRegulationSubType.toNumber(
          faker.helpers.arrayElement(
            Object.values(RegulationSubType).filter((subType) => subType !== RegulationSubType.NONE),
          ),
        ),
  );
});
