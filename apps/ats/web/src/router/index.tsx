// SPDX-License-Identifier: Apache-2.0

import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from "./Routes";
import { useAccountStore } from "../store/accountStore";
import { useEffect } from "react";
import { useSecurityStore } from "../store/securityStore";

export const router = createBrowserRouter(routes);

const AppRouter = () => {
  const { isResetted, reset: resetAccountStore } = useAccountStore();
  const { reset: reserSecurityStore } = useSecurityStore();

  useEffect(() => {
    if (!isResetted) {
      resetAccountStore();
      reserSecurityStore();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <RouterProvider router={router} />;
};

export default AppRouter;
