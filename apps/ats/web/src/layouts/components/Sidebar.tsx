// SPDX-License-Identifier: Apache-2.0

import { Stack } from "@chakra-ui/react";
import { Sidebar as BaseSidebar, SidebarItem } from "io-bricks-ui";
import { House, Pause, HandPalm, Key } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { RouteName } from "../../router/RouteName";
import { RoutePath } from "../../router/RoutePath";
import { RouterManager } from "../../router/RouterManager";
import { useUserStore } from "../../store/userStore";
import { getLayoutBg } from "./helper";

export const Sidebar = () => {
  const { t } = useTranslation("routes");
  const location = useLocation();
  const { type: userType } = useUserStore();

  const routes = [
    {
      label: t(RouteName.Dashboard),
      icon: House,
      isActive: location.pathname === RoutePath.DASHBOARD,
      to: RouteName.Dashboard,
    },
    {
      label: t(RouteName.ExternalPauseList),
      icon: Pause,
      isActive: location.pathname.includes(RoutePath.EXTERNAL_PAUSE_LIST),
      to: RouteName.ExternalPauseList,
    },
    {
      label: t(RouteName.ExternalControlList),
      icon: HandPalm,
      isActive: location.pathname.includes(RoutePath.EXTERNAL_CONTROL_LIST),
      to: RouteName.ExternalControlList,
    },
    {
      label: t(RouteName.ExternalKYCList),
      icon: Key,
      isActive: location.pathname.includes(RoutePath.EXTERNAL_KYC_LIST),
      to: RouteName.ExternalKYCList,
    },
  ];

  return (
    <BaseSidebar
      data-testid="sidebar-layout"
      topContent={
        <Stack spacing={6}>
          {routes.map((props, index) => (
            <SidebarItem
              {...props}
              key={index}
              icon={props.icon}
              onClick={() => RouterManager.to(props.to)}
              textAlign={"center"}
            />
          ))}
        </Stack>
      }
      // seems to be that Sidebar does not accept variants
      sx={{
        bg: getLayoutBg[userType],
        position: "relative",
        apply: "textStyles.ElementsRegularXS",
        flexDirection: "column",
        justifyContent: "space-between",
        pt: 16,
        pb: 10,
        w: "104px",
      }}
    />
  );
};
