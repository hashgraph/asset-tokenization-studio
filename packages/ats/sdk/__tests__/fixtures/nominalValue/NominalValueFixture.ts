// SPDX-License-Identifier: Apache-2.0

import { Faker } from "@faker-js/faker";
import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { SetNominalValueCommand } from "@command/security/nominalValue/setNominalValue/SetNominalValueCommand";
import { SetNominalValueCurrencyCommand } from "@command/security/nominalValue/setNominalValueCurrency/SetNominalValueCurrencyCommand";
import { GetNominalValueQuery } from "@query/security/nominalValue/getNominalValue/GetNominalValueQuery";
import { GetNominalValueDecimalsQuery } from "@query/security/nominalValue/getNominalValueDecimals/GetNominalValueDecimalsQuery";
import { GetNominalValueCurrencyQuery } from "@query/security/nominalValue/getNominalValueCurrency/GetNominalValueCurrencyQuery";
import SetNominalValueRequest from "@port/in/request/security/operations/nominalValue/SetNominalValueRequest";
import SetNominalValueCurrencyRequest from "@port/in/request/security/operations/nominalValue/SetNominalValueCurrencyRequest";
import GetNominalValueRequest from "@port/in/request/security/operations/nominalValue/GetNominalValueRequest";
import GetNominalValueDecimalsRequest from "@port/in/request/security/operations/nominalValue/GetNominalValueDecimalsRequest";
import GetNominalValueCurrencyRequest from "@port/in/request/security/operations/nominalValue/GetNominalValueCurrencyRequest";

// bytes3 ISO 4217 currency code: "0x" + 6 hex chars (3 bytes).
const fakeCurrencyCode = (faker: Faker) => faker.string.hexadecimal({ length: 6, prefix: "0x", casing: "lower" });

export const SetNominalValueCommandFixture = createFixture<SetNominalValueCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.nominalValue.faker((faker) => faker.number.int({ min: 1, max: 1000000 }).toString());
  command.nominalValueDecimals.faker((faker) => faker.number.int({ min: 0, max: 18 }));
});

export const SetNominalValueCurrencyCommandFixture = createFixture<SetNominalValueCurrencyCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.nominalValueCurrency.faker(fakeCurrencyCode);
});

export const GetNominalValueQueryFixture = createFixture<GetNominalValueQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetNominalValueDecimalsQueryFixture = createFixture<GetNominalValueDecimalsQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetNominalValueCurrencyQueryFixture = createFixture<GetNominalValueCurrencyQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const SetNominalValueRequestFixture = createFixture<SetNominalValueRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.nominalValue.faker((faker) => faker.number.int({ min: 1, max: 1000000 }).toString());
  request.nominalValueDecimals.faker((faker) => faker.number.int({ min: 0, max: 18 }));
});

export const SetNominalValueCurrencyRequestFixture = createFixture<SetNominalValueCurrencyRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.nominalValueCurrency.faker(fakeCurrencyCode);
});

export const GetNominalValueRequestFixture = createFixture<GetNominalValueRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetNominalValueDecimalsRequestFixture = createFixture<GetNominalValueDecimalsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetNominalValueCurrencyRequestFixture = createFixture<GetNominalValueCurrencyRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});
