// SPDX-License-Identifier: Apache-2.0

import { useLocation } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { RoutePath } from "../router/RoutePath";
import { RouteName } from "../router/RouteName";
import i18n from "i18next";

export interface BreadcrumbItem {
  label: string;
  link: {
    as: typeof RouterLink;
    to: string;
  };
  isActive?: boolean;
}

interface RouterBreadcrumbsOptions {
  excludePaths?: string[];
}

const t = (key: RouteName) => i18n.t(`routes:${key}`);

const routeBreadcrumbMap: Record<string, string> = {
  [RoutePath.LANDING]: t(RouteName.Landing),
  [RoutePath.ASSETS]: t(RouteName.Assets),
  [RoutePath.IMPORT_ASSET]: t(RouteName.ImportAsset),
};

export const useBreadcrumbs = (options?: RouterBreadcrumbsOptions): BreadcrumbItem[] => {
  const location = useLocation();
  const { excludePaths = [] } = options || {};

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = "";

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    currentPath += `/${segment}`;

    if (excludePaths.includes(currentPath)) {
      continue;
    }

    let breadcrumbLabel = routeBreadcrumbMap[currentPath];

    if (!breadcrumbLabel && currentPath.startsWith("/assets/") && currentPath !== "/assets") {
      if (currentPath.endsWith("/make-payment")) {
        breadcrumbLabel = "Make Payment";
      } else {
        breadcrumbLabel = t(RouteName.AssetDetail);
      }
    }

    if (!breadcrumbLabel) {
      breadcrumbLabel = segment.charAt(0).toUpperCase() + segment.slice(1);
    }

    const isLastElement = i === pathSegments.length - 1;

    breadcrumbs.push({
      label: breadcrumbLabel,
      link: {
        as: RouterLink,
        to: isLastElement ? "#" : currentPath,
      },
      isActive: isLastElement,
    });
  }

  return breadcrumbs;
};
