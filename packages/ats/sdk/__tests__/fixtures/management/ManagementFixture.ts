// SPDX-License-Identifier: Apache-2.0

import { UpdateConfigCommand } from "@command/management/updateConfig/updateConfigCommand";
import { UpdateConfigVersionCommand } from "@command/management/updateConfigVersion/updateConfigVersionCommand";
import { UpdateResolverCommand } from "@command/management/updateResolver/updateResolverCommand";
import ContractId from "@domain/context/contract/ContractId";
import { UpdateConfigVersionRequest, UpdateConfigRequest, UpdateResolverRequest, GetConfigInfoRequest } from "src";
import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";

export const UpdateConfigCommandFixture = createFixture<UpdateConfigCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.configVersion.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.configId.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x" }));
});
export const UpdateConfigVersionCommandFixture = createFixture<UpdateConfigVersionCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.configVersion.faker((faker) => faker.number.int({ min: 1, max: 5 }));
});
export const UpdateResolverCommandFixture = createFixture<UpdateResolverCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.configVersion.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.configId.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x" }));
  command.resolver.as(() => new ContractId(HederaIdPropsFixture.create().value));
});

export const UpdateConfigVersionRequestFixture = createFixture<UpdateConfigVersionRequest>((request) => {
  request.configVersion.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const UpdateConfigRequestFixture = createFixture<UpdateConfigRequest>((request) => {
  request.configVersion.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.configId.faker(
    (faker) =>
      `0x000000000000000000000000000000000000000000000000000000000000000${faker.number.int({ min: 1, max: 9 })}`,
  );
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const UpdateResolverRequestFixture = createFixture<UpdateResolverRequest>((request) => {
  request.configVersion.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.configId.faker(
    (faker) =>
      `0x000000000000000000000000000000000000000000000000000000000000000${faker.number.int({ min: 1, max: 9 })}`,
  );
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.resolver.as(() => HederaIdPropsFixture.create().value);
});

export const GetConfigInfoRequestFixture = createFixture<GetConfigInfoRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});
