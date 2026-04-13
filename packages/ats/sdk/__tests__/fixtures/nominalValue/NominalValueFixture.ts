// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { SetNominalValueCommand } from "@command/security/nominalValue/setNominalValue/SetNominalValueCommand";
import { GetNominalValueQuery } from "@query/security/nominalValue/getNominalValue/GetNominalValueQuery";
import { GetNominalValueDecimalsQuery } from "@query/security/nominalValue/getNominalValueDecimals/GetNominalValueDecimalsQuery";
import SetNominalValueRequest from "@port/in/request/security/operations/nominalValue/SetNominalValueRequest";
import GetNominalValueRequest from "@port/in/request/security/operations/nominalValue/GetNominalValueRequest";
import GetNominalValueDecimalsRequest from "@port/in/request/security/operations/nominalValue/GetNominalValueDecimalsRequest";

export const SetNominalValueCommandFixture = createFixture<SetNominalValueCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.nominalValue.faker((faker) => faker.number.int({ min: 1, max: 1000000 }).toString());
  command.nominalValueDecimals.faker((faker) => faker.number.int({ min: 0, max: 18 }));
});

export const GetNominalValueQueryFixture = createFixture<GetNominalValueQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetNominalValueDecimalsQueryFixture = createFixture<GetNominalValueDecimalsQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const SetNominalValueRequestFixture = createFixture<SetNominalValueRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.nominalValue.faker((faker) => faker.number.int({ min: 1, max: 1000000 }).toString());
  request.nominalValueDecimals.faker((faker) => faker.number.int({ min: 0, max: 18 }));
});

export const GetNominalValueRequestFixture = createFixture<GetNominalValueRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetNominalValueDecimalsRequestFixture = createFixture<GetNominalValueDecimalsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});
