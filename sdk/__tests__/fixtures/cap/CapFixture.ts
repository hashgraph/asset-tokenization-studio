import { HederaIdPropsFixture } from '../shared/DataFixture';
import { createFixture } from '../config';
import { SetMaxSupplyCommand } from '../../../src/app/usecase/command/security/operations/cap/SetMaxSupplyCommand';

export const SetMaxSupplyCommandFixture = createFixture<SetMaxSupplyCommand>(
  (command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.maxSupply.faker((faker) =>
      faker.number.int({ min: 1, max: 1000000 }).toString(),
    );
  },
);
