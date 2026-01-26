// SPDX-License-Identifier: Apache-2.0

import { RouteName } from "./RouteName";

export const RoutePath: Record<RouteName, string> = {
  [RouteName.Landing]: "/",
  [RouteName.Assets]: "/assets",
  [RouteName.Distributions]: "/distributions",
  [RouteName.ImportAsset]: "/assets/import",
  [RouteName.AssetDetail]: "/assets/:id",
  [RouteName.NewDistribution]: "/assets/:id/new-distribution",
  [RouteName.DistributionsDetails]: "/assets/:id/:type/:itemId/distributions-details",
};
