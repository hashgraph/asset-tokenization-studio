// SPDX-License-Identifier: Apache-2.0

import { Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { routes } from "./Routes";

export const router = createBrowserRouter(routes);

const AppRouter = () => {
  return (
    <Suspense>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default AppRouter;
