// SPDX-License-Identifier: Apache-2.0

import getBreadcrumbs, { BreadcrumbData, Options as RouterBreadcrumbsOptions } from "use-react-router-breadcrumbs";
import { routes } from "../router/Routes";
import { Link as RouterLink } from "react-router-dom";

export const useBreadcrumbs = (options?: RouterBreadcrumbsOptions) => {
  return getBreadcrumbs(routes, {
    disableDefaults: true,
    ...options,
  }).map((props: BreadcrumbData) => {
    const label = (() => {
      const { breadcrumb } = props.match.route!;
      // @ts-ignore
      return typeof breadcrumb === "string" ? breadcrumb : breadcrumb(props);
    })();

    return {
      label,
      link: { as: RouterLink, to: props.match.pathname },
    };
  });
};
