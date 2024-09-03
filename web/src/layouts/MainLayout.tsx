import { Outlet } from "react-router-dom";
import { Stack } from "@chakra-ui/react";
import _capitalize from "lodash/capitalize";
import { Sidebar } from "./components/Sidebar";
import { useWalletStore } from "../store/walletStore";
import { Header } from "./components/Header";
import { WalletStatus } from "../utils/constants";

export const MainLayout = () => {
  const { connectionStatus } = useWalletStore();
  const disconnected = connectionStatus === WalletStatus.disconnected;

  return (
    <>
      {!disconnected && <Sidebar />}
      <Stack w="full">
        <Header />
        <Stack as="main" h="full" p={6} overflow="auto">
          <Outlet />
        </Stack>
      </Stack>
    </>
  );
};
