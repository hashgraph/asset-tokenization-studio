// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { ActivateInternalKycCommand } from "@command/security/kyc/activateInternalKyc/ActivateInternalKycCommand";
import { DeactivateInternalKycCommand } from "@command/security/kyc/deactivateInternalKyc/DeactivateInternalKycCommand";
import { IsInternalKycActivatedQuery } from "@query/security/kyc/isInternalKycActivated/IsInternalKycActivatedQuery";
import ActivateInternalKycRequest from "@port/in/request/security/kyc/ActivateInternalKycRequest";
import DeactivateInternalKycRequest from "@port/in/request/security/kyc/DeactivateInternalKycRequest";
import IsInternalKycActivatedRequest from "@port/in/request/security/kyc/IsInternalKycActivatedRequest";
import { GetKycAccountsCountQuery } from "@query/security/kyc/getKycAccountsCount/GetKycAccountsCountQuery";
import { GetKycAccountsDataQuery } from "@query/security/kyc/getKycAccountsData/GetKycAccountsDataQuery";
import { GetKycForQuery } from "@query/security/kyc/getKycFor/GetKycForQuery";
import { Kyc } from "@domain/context/kyc/Kyc";
import { GetKycStatusForQuery } from "@query/security/kyc/getKycStatusFor/GetKycStatusForQuery";
import GrantKycRequest from "@port/in/request/security/kyc/GrantKycRequest";
import RevokeKycRequest from "@port/in/request/security/kyc/RevokeKycRequest";
import GetKycForRequest from "@port/in/request/security/kyc/GetKycForRequest";
import GetKycAccountsCountRequest from "@port/in/request/security/kyc/GetKycAccountsCountRequest";
import GetKycAccountsDataRequest from "@port/in/request/security/kyc/GetKycAccountsDataRequest";
import { KycAccountData } from "@domain/context/kyc/KycAccountData";
import GetKycStatusForRequest from "@port/in/request/security/kyc/GetKycStatusForRequest";
import { SignedCredential } from "@terminal3/vc_core";
import { GrantKycCommand } from "@command/security/kyc/grantKyc/GrantKycCommand";
import { RevokeKycCommand } from "@command/security/kyc/revokeKyc/RevokeKycCommand";

export const ActivateInternalKycCommandFixture = createFixture<ActivateInternalKycCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetKycAccountsCountQueryFixture = createFixture<GetKycAccountsCountQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.kycStatus.faker((faker) => faker.number.int({ min: 0, max: 1 }));
});

export const DeactivateInternalKycCommandFixture = createFixture<DeactivateInternalKycCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetKycAccountsDataQueryFixture = createFixture<GetKycAccountsDataQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.kycStatus.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  query.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const IsInternalKycActivatedQueryFixture = createFixture<IsInternalKycActivatedQuery>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetKycForQueryFixture = createFixture<GetKycForQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GrantKycRequestFixture = createFixture<GrantKycRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.vcBase64.faker((faker) => Buffer.from(faker.lorem.paragraph()).toString("base64"));
});

export const RevokeKycRequestFixture = createFixture<RevokeKycRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetKycForRequestFixture = createFixture<GetKycForRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetKycAccountsCountRequestFixture = createFixture<GetKycAccountsCountRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.kycStatus.faker((faker) => faker.number.int({ min: 0, max: 1 }));
});

export const GetKycAccountsDataRequestFixture = createFixture<GetKycAccountsDataRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.kycStatus.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  request.start.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  request.end.faker((faker) => faker.number.int({ min: 0, max: 1 }));
});

export const GetKycStatusForRequestFixture = createFixture<GetKycStatusForRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const ActivateInternalKycRequestFixture = createFixture<ActivateInternalKycRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetKycStatusForQueryFixture = createFixture<GetKycStatusForQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const KycAccountDataFixture = createFixture<KycAccountData>((props) => {
  props.account.as(() => HederaIdPropsFixture.create().value);
  props.validFrom.faker((faker) => faker.date.past());
  props.validTo.faker((faker) => faker.date.future());
  props.vcId.as(() => HederaIdPropsFixture.create().value);
  props.issuer.as(() => HederaIdPropsFixture.create().value);
  props.status.faker((faker) => faker.number.int({ min: 0, max: 1 }));
});

export const DeactivateInternalKycRequestFixture = createFixture<DeactivateInternalKycRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const IsInternalKycActivatedRequestFixture = createFixture<IsInternalKycActivatedRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const KycFixture = createFixture<Kyc>((props) => {
  props.validFrom.faker((faker) => faker.date.past().getTime().toString());
  props.validTo.faker((faker) => faker.date.future().getTime().toString());
  props.vcId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  props.issuer.as(() => HederaIdPropsFixture.create().value);
  props.status.faker((faker) => faker.number.int({ min: 0, max: 1 }));
});

export const GrantKycCommandFixture = createFixture<GrantKycCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
  command.vcBase64.faker((faker) => faker.string.alphanumeric);
});

export const SignedCredentialFixture = createFixture<SignedCredential>((credential) => {
  credential.id.faker((faker) => faker.string.uuid());
  let validFrom: Date;
  credential.validFrom?.faker((faker) => {
    validFrom = faker.date.future();
    return validFrom.getTime().toString();
  });
  credential.validUntil?.faker((faker) => faker.date.future({ refDate: validFrom }).getTime().toString());
});

export const RevokeKycCommandFixture = createFixture<RevokeKycCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.targetId.as(() => HederaIdPropsFixture.create().value);
});
