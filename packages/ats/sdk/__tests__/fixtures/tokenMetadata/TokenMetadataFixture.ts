// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { SetNameCommand } from "@command/security/operations/tokenMetadata/setName/SetNameCommand";
import { SetSymbolCommand } from "@command/security/operations/tokenMetadata/setSymbol/SetSymbolCommand";
import SetNameRequest from "@port/in/request/security/operations/tokeMetadata/SetNameRequest";
import SetSymbolRequest from "@port/in/request/security/operations/tokeMetadata/SetSymbolRequest";
import { SetOnchainIDCommand } from "@command/security/operations/tokenMetadata/setOnchainID/SetOnchainIDCommand";
import { OnchainIDQuery } from "@query/security/tokenMetadata/onchainId/OnchainIDQuery";
import SetOnchainIDRequest from "@port/in/request/security/operations/tokeMetadata/SetOnchainIDRequest";
import OnchainIDRequest from "@port/in/request/security/operations/tokeMetadata/OnchainIDRequest";

export const SetNameCommandFixture = createFixture<SetNameCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.name.faker((faker) => faker.company.name());
});

export const SetSymbolCommandFixture = createFixture<SetSymbolCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.symbol.faker((faker) => faker.string.alpha({ length: 3, casing: "upper" }));
});

export const SetNameRequestFixture = createFixture<SetNameRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.name.faker((faker) => faker.company.name());
});

export const SetSymbolRequestFixture = createFixture<SetSymbolRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.symbol.faker((faker) => faker.string.alpha({ length: 3, casing: "upper" }));
});

export const SetOnchainIDCommandFixture = createFixture<SetOnchainIDCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.onchainID.as(() => HederaIdPropsFixture.create().value);
});

export const OnchainIDQueryFixture = createFixture<OnchainIDQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const SetOnchainIDRequestFixture = createFixture<SetOnchainIDRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.onchainID.as(() => HederaIdPropsFixture.create().value);
});

export const OnchainIDRequestFixture = createFixture<OnchainIDRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});
