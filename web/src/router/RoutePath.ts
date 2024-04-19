import { RouteName } from "./RouteName";

export const RoutePath: Record<RouteName, string> = {
  [RouteName.Dashboard]: "/",
  [RouteName.Landing]: "/connect-to-metamask",
  [RouteName.DigitalSecurityDetails]: "/security/:id",
  [RouteName.DigitalSecurityMint]: "/security/:id/mint",
  [RouteName.DigitalSecurityTransfer]: "/security/:id/transfer",
  [RouteName.DigitalSecurityForceTransfer]: "/security/:id/forceTransfer",
  [RouteName.DigitalSecurityRedeem]: "/security/:id/redeem",
  [RouteName.DigitalSecurityForceRedeem]: "/security/:id/forceRedeem",
  [RouteName.DigitalSecuritiesList]: "/list/:type",
  [RouteName.AddSecurity]: "/security/add",
  [RouteName.CreateSecurity]: "/security/create",
  [RouteName.CreateEquity]: "/security/create/equity",
  [RouteName.CreateBond]: "/security/create/bond",
};
