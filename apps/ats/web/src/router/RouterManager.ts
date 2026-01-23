// SPDX-License-Identifier: Apache-2.0

import type { ReverseParams } from "named-urls";
import { reverse } from "named-urls";
import { router } from ".";
import { RouteName } from "./RouteName";
import { RoutePath } from "./RoutePath";

export interface RouteParams {
  params?: ReverseParams;
  extra?: string;
  state?: object;
}

export class BaseRouterManager {
  constructor(private routes: Record<RouteName, string> = RoutePath) {}

  #getPath(name: RouteName, { params, extra = "" }: RouteParams) {
    const pattern = this.routes[name] + extra;
    return reverse(pattern, params);
  }

  to(name: RouteName, { state, ...params }: RouteParams = {}) {
    const pathname = this.#getPath(name, params);
    return router.navigate({ pathname }, { state });
  }

  getUrl(name: RouteName, params: RouteParams = {}) {
    const path = this.#getPath(name, params);
    return reverse(path);
  }

  goBack() {
    return router.navigate(-1);
  }

  goDashboard() {
    return this.to(RouteName.Dashboard);
  }
}

export const RouterManager = new BaseRouterManager(RoutePath);
