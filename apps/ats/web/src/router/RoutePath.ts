// SPDX-License-Identifier: Apache-2.0

import { RouteName } from "./RouteName";

export const RoutePath: Record<RouteName, string> = {
  [RouteName.Dashboard]: "/",
  [RouteName.ExternalPauseList]: "/external-pause",
  [RouteName.CreateExternalPause]: "/external-pause/create",
  [RouteName.AddExternalPause]: "/external-pause/add",
  [RouteName.Landing]: "/connect-to-metamask",
  [RouteName.ExternalControlList]: "/external-control",
  [RouteName.CreateExternalControl]: "/external-control/create",
  [RouteName.AddExternalControl]: "/external-control/add",
  [RouteName.ExternalControlDetails]: "/external-control/:id",
  [RouteName.ExternalKYCList]: "/external-kyc",
  [RouteName.CreateExternalKYC]: "/external-kyc/create",
  [RouteName.AddExternalKYC]: "/external-kyc/add",
  [RouteName.ExternalKYCDetails]: "/external-kyc/:id",
  [RouteName.DigitalSecurityDetails]: "/security/:id",
  [RouteName.DigitalSecurityMint]: "/security/:id/mint",
  [RouteName.DigitalSecurityFreeze]: "/security/:id/freeze",
  [RouteName.DigitalSecurityTransfer]: "/security/:id/transfer",
  [RouteName.DigitalSecurityForceTransfer]: "/security/:id/forceTransfer",
  [RouteName.DigitalSecurityRedeem]: "/security/:id/redeem",
  [RouteName.DigitalSecurityForceRedeem]: "/security/:id/forceRedeem",
  [RouteName.DigitalSecurityLock]: "/security/:id/lock",
  [RouteName.DigitalSecuritiesList]: "/list/:type",
  [RouteName.AddSecurity]: "/security/add",
  [RouteName.CreateSecurity]: "/security/create",
  [RouteName.CreateEquity]: "/security/create/equity",
  [RouteName.CreateBond]: "/security/create/bond",
};
