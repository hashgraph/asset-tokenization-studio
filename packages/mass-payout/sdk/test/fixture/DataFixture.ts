// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "./config";

export const EvmAddressPropsFixture = createFixture<{ value: string }>((props) => {
  props.value.faker((faker) => faker.string.hexadecimal({ length: 40, casing: "lower" }));
});

export const HederaIdPropsFixture = createFixture<{ value: string }>((props) => {
  props.value.faker((faker) => `0.0.${faker.number.int({ min: 100, max: 999 })}`);
});
