// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { SecurityProps } from "@domain/context/security/Security";
import { SecurityType } from "@domain/context/factory/SecurityType";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { RegulationSubType, RegulationType } from "@domain/context/factory/RegulationType";
import { RegulationFixture } from "./RegulationFixture";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "./DataFixture";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { HederaId } from "@domain/context/shared/HederaId";
import { faker } from "@faker-js/faker";
import { GetSecurityQuery } from "@query/security/get/GetSecurityQuery";

export const SecurityPropsFixture = createFixture<SecurityProps>((security) => {
  security.name.faker((faker) => faker.company.name());
  security.symbol.faker((faker) => faker.string.alpha({ length: 3, casing: "upper" }));
  security.isin.faker((faker) => `US${faker.string.numeric(9)}`);
  security.type?.faker((faker) => faker.helpers.arrayElement(Object.values(SecurityType)));
  security.decimals.faker((faker) => faker.number.int({ min: 0, max: 18 }));
  security.isWhiteList.faker((faker) => faker.datatype.boolean());
  security.erc20VotesActivated?.faker((faker) => faker.datatype.boolean());
  security.isControllable.faker((faker) => faker.datatype.boolean());
  security.arePartitionsProtected.faker((faker) => faker.datatype.boolean());
  security.clearingActive.faker((faker) => faker.datatype.boolean());
  security.internalKycActivated.faker((faker) => faker.datatype.boolean());
  security.isMultiPartition.faker((faker) => faker.datatype.boolean());
  security.isIssuable?.faker((faker) => faker.datatype.boolean());
  security.totalSupply?.faker((faker) =>
    BigDecimal.fromString(faker.finance.amount({ min: 1000, max: 1000000, dec: 0 })),
  );
  security.maxSupply?.faker((faker) =>
    BigDecimal.fromString(faker.finance.amount({ min: 1000000, max: 10000000, dec: 0 })),
  );
  security.diamondAddress?.as(() => new HederaId(HederaIdPropsFixture.create().value));
  security.evmDiamondAddress?.as(() => new EvmAddress(EvmAddressPropsFixture.create().value));
  security.paused?.faker((faker) => faker.datatype.boolean());
  const regulationType = faker.helpers.arrayElement(
    Object.values(RegulationType).filter((type) => type !== RegulationType.NONE),
  );
  security.regulationType?.as(() => regulationType);
  security.regulationsubType?.faker((faker) =>
    regulationType === RegulationType.REG_S
      ? RegulationSubType.NONE
      : faker.helpers.arrayElement(
          Object.values(RegulationSubType).filter((subType) => subType !== RegulationSubType.NONE),
        ),
  );
  security.regulation?.fromFixture(RegulationFixture);
  security.isCountryControlListWhiteList.faker((faker) => faker.datatype.boolean());
  security.countries?.faker((faker) =>
    faker.helpers
      .arrayElements(
        Array.from({ length: 5 }, () => faker.location.countryCode({ variant: "alpha-2" })),
        { min: 1, max: 5 },
      )
      .join(","),
  );
  security.info?.faker((faker) => faker.lorem.sentence());
});

export const GetSecurityQueryFixture = createFixture<GetSecurityQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});
