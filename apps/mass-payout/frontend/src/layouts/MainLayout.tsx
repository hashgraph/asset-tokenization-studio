// SPDX-License-Identifier: Apache-2.0

import { Outlet } from "react-router-dom";
import { Stack } from "@chakra-ui/react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";

export const MainLayout = () => {
  return (
    <>
      <Sidebar />
      <Stack w="full">
        <Header />
        <Stack as="main" h="full" p={6} bg="neutral.100">
          <Outlet />
        </Stack>
      </Stack>
    </>
  );
};
