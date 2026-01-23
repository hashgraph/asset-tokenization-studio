// SPDX-License-Identifier: Apache-2.0

import { AccountProps } from "@domain/context/account/Account";
import { createFixture } from "../config";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { HederaId } from "@domain/context/shared/HederaId";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";

export const EvmAddressPropsFixture = createFixture<{ value: string }>((props) => {
  props.value.faker((faker) => faker.string.hexadecimal({ length: 40, casing: "lower" }));
});

export const HederaIdPropsFixture = createFixture<{ value: string }>((props) => {
  props.value.faker((faker) => `0.0.${faker.number.int({ min: 100, max: 999 })}`);
});

export const AccountPropsFixture = createFixture<AccountProps>((account) => {
  account.id.as(() => new HederaId(HederaIdPropsFixture.create().value));
  account.evmAddress?.as(() => EvmAddressPropsFixture.create().value);
});

export const HederaIdZeroAddressFixture = createFixture<{ address: string }>((props) => {
  props.address.faker(() => "0.0.0");
});

export const ContractIdPropFixture = createFixture<{ value: string }>((props) => {
  props.value.as(() => HederaIdPropsFixture.create().value);
});

export const TransactionIdFixture = createFixture<{ id: string }>((props) => {
  props.id.as(() => HederaIdPropsFixture.create().value);
});

export const CouponIdFixture = createFixture<{ id: string }>((props) => {
  props.id.faker((faker) => faker.number.hex({ min: 1, max: 1000 }));
});

export const GetContractInvalidStringFixture = createFixture<{ value: string }>((props) => {
  props.value.faker((faker) => faker.string.alpha(5));
});

export const PartitionIdFixture = createFixture<{ value: string }>((props) => {
  props.value.faker(
    (faker) =>
      `0x000000000000000000000000000000000000000000000000000000000000000${faker.number.int({ min: 1, max: 9 })}`,
  );
});

export const NonDefaultPartitionIdFixture = createFixture<{ value: string }>((props) => {
  props.value.faker(
    (faker) =>
      `0x000000000000000000000000000000000000000000000000000000000000000${faker.number.int({ min: 2, max: 9 })}`,
  );
});

export const RoleFixture = createFixture<{ value: string }>((props) => {
  props.value.faker((faker) => faker.helpers.arrayElement(Object.values(SecurityRole)));
});

export const AmountFixture = createFixture<{ value: BigDecimal }>((props) => {
  props.value.faker((faker) => BigDecimal.fromString(faker.finance.amount({ min: 1000000, max: 10000000, dec: 0 })));
});

export const TransactionResponseFixture = createFixture<TransactionResponse>((res) => {
  res.id!.as(() => TransactionIdFixture.create().id);
  res.response!.asConstant("1");
});

export const ErrorMsgFixture = createFixture<{ msg: string }>((props) => {
  props.msg.faker((faker) => faker.lorem.words());
});
