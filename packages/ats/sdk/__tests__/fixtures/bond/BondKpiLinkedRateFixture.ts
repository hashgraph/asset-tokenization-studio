// SPDX-License-Identifier: Apache-2.0

import { CreateBondKpiLinkedRateCommand } from "@command/bond/createkpilinkedrate/CreateBondKpiLinkedRateCommand";
import ContractId from "@domain/context/contract/ContractId";
import { createFixture } from "../config";
import { ContractIdPropFixture, HederaIdPropsFixture } from "../shared/DataFixture";
import { SecurityPropsFixture } from "../shared/SecurityFixture";

export const CreateBondKpiLinkedRateCommandFixture = createFixture<CreateBondKpiLinkedRateCommand>((command) => {
  command.security.fromFixture(SecurityPropsFixture);
  command.currency.faker((faker) => faker.finance.currencyCode());
  command.nominalValue.faker((faker) => faker.finance.amount({ min: 1, max: 10, dec: 2 }));
  command.nominalValueDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.startingDate.faker((faker) => faker.date.recent().getTime().toString());
  command.maturityDate.faker((faker) => faker.date.future({ years: 2 }).getTime().toString());
  command.factory?.as(() => new ContractId(ContractIdPropFixture.create().value));
  command.resolver?.as(() => new ContractId(ContractIdPropFixture.create().value));
  command.configId?.as(() => HederaIdPropsFixture.create().value);
  command.configVersion?.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.maxRate.faker((faker) => faker.number.int({ min: 200, max: 999 }));
  command.baseRate.faker((faker) => faker.number.int({ min: 101, max: 199 }));
  command.minRate.faker((faker) => faker.number.int({ min: 1, max: 99 }));
  command.startPeriod.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  command.startRate.faker((faker) => faker.number.int({ min: 100, max: 999 }));
  command.missedPenalty.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  command.reportPeriod.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  command.rateDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.maxDeviationCap.faker((faker) => faker.number.int({ min: 200, max: 999 }));
  command.baseLine.faker((faker) => faker.number.int({ min: 101, max: 199 }));
  command.maxDeviationFloor.faker((faker) => faker.number.int({ min: 1, max: 99 }));
  command.impactDataDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.adjustmentPrecision.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.diamondOwnerAccount?.as(() => HederaIdPropsFixture.create().value);
  command.externalControlListsIds?.as(() => [HederaIdPropsFixture.create().value]);
  command.externalKycListsIds?.as(() => [HederaIdPropsFixture.create().value]);
  command.complianceId?.as(() => HederaIdPropsFixture.create().value);
  command.identityRegistryId?.as(() => HederaIdPropsFixture.create().value);
  command.proceedRecipientsIds?.faker((faker) => [HederaIdPropsFixture.create().value]);
  command.proceedRecipientsData?.as(() => ["0x0000"]);
});
