// SPDX-License-Identifier: Apache-2.0

import { lazy } from "react";
import i18n from "i18next";

import { RouteName } from "./RouteName";
import { RoutePath } from "./RoutePath";
import { MainLayout } from "@/layouts/MainLayout";

// Lazy load components
const Landing = lazy(() =>
  import("@/views/Landing/Landing").then((module) => ({
    default: module.Landing,
  })),
);
const Assets = lazy(() =>
  import("@/views/Assets/Assets/Assets").then((module) => ({
    default: module.Assets,
  })),
);
const AssetDetail = lazy(() =>
  import("@/views/Assets/AssetDetail/AssetDetail").then((module) => ({
    default: module.AssetDetail,
  })),
);
const NewDistribution = lazy(() =>
  import("@/views/Assets/NewDistribution/NewDistribution").then((module) => ({
    default: module.NewDistribution,
  })),
);
const ImportAsset = lazy(() =>
  import("@/views/Assets/ImportAsset/ImportAsset").then((module) => ({
    default: module.ImportAsset,
  })),
);
const DistributionsDetails = lazy(() => import("@/views/Assets/DistributionsDetails/DistributionsDetails"));

const t = (key: RouteName) => i18n.t(`routes:${key}`);

export const routes = [
  {
    element: <MainLayout />,
    children: [
      {
        path: RoutePath.LANDING,
        breadcrumb: t(RouteName.Landing),
        element: <Landing />,
      },
      {
        path: RoutePath.ASSETS,
        breadcrumb: t(RouteName.Assets),
        element: <Assets />,
      },
      {
        path: RoutePath.ASSET_DETAIL,
        breadcrumb: t(RouteName.AssetDetail),
        element: <AssetDetail />,
      },
      {
        path: RoutePath.NEW_DISTRIBUTION,
        breadcrumb: t(RouteName.NewDistribution),
        element: <NewDistribution />,
      },
      {
        path: RoutePath.IMPORT_ASSET,
        breadcrumb: t(RouteName.ImportAsset),
        element: <ImportAsset />,
      },
      {
        path: RoutePath.DISTRIBUTIONS_DETAILS,
        breadcrumb: t(RouteName.DistributionsDetails),
        element: <DistributionsDetails />,
      },
    ],
  },
];
