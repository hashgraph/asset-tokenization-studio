// SPDX-License-Identifier: Apache-2.0

import GetAccountInfoRequest from "@port/in/request/account/GetAccountInfoRequest";
import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { GetAccountBalanceQuery } from "@query/account/balance/GetAccountBalanceQuery";
import { IsInControlListQuery } from "@query/account/controlList/IsInControlListQuery";
import { GetAccountInfoQuery } from "@query/account/info/GetAccountInfoQuery";
import GetAccountBalanceRequest from "@port/in/request/account/GetAccountBalanceRequest";
import { AccountProps } from "@domain/context/account/Account";
import { HederaId } from "@domain/context/shared/HederaId";

export const GetAccountBalanceQueryFixture = createFixture<GetAccountBalanceQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetAccountInfoRequestFixture = createFixture<GetAccountInfoRequest>((request) => {
  request.account.as(() => ({
    accountId: HederaIdPropsFixture.create().value,
  }));
});

export const IsInControlListQueryFixture = createFixture<IsInControlListQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetAccountInfoQueryFixture = createFixture<GetAccountInfoQuery>((query) => {
  query.id.as(() => HederaIdPropsFixture.create().value);
});
export const GetAccountBalanceRequestFixture = createFixture<GetAccountBalanceRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const AccountPropsFixture = createFixture<AccountProps>((props) => {
  props.id.as(() => new HederaId(HederaIdPropsFixture.create().value));
});
