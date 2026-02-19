// SPDX-License-Identifier: Apache-2.0

import { CreateBondFixedRateCommand } from "@command/bond/createfixedrate/CreateBondFixedRateCommand";
import ContractId from "@domain/context/contract/ContractId";
import { createFixture } from "../config";
import { ContractIdPropFixture, HederaIdPropsFixture } from "../shared/DataFixture";
import { SecurityPropsFixture } from "../shared/SecurityFixture";

export const CreateBondFixedRateCommandFixture = createFixture<CreateBondFixedRateCommand>((command) => {
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
  command.rate.faker((faker) => faker.number.int({ min: 100, max: 999 }));
  command.rateDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.diamondOwnerAccount?.as(() => HederaIdPropsFixture.create().value);
  command.externalControlListsIds?.as(() => [HederaIdPropsFixture.create().value]);
  command.externalKycListsIds?.as(() => [HederaIdPropsFixture.create().value]);
  command.complianceId?.as(() => HederaIdPropsFixture.create().value);
  command.identityRegistryId?.as(() => HederaIdPropsFixture.create().value);
  command.proceedRecipientsIds?.faker((faker) => [HederaIdPropsFixture.create().value]);
  command.proceedRecipientsData?.as(() => ["0x0000"]);
});
