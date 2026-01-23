// SPDX-License-Identifier: Apache-2.0

import { Stack } from "@chakra-ui/react";
import { Sidebar as BaseSidebar, SidebarItem } from "io-bricks-ui";
import { Briefcase /*, ChartLine*/ } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { RouteName } from "../../router/RouteName";
import { RoutePath } from "../../router/RoutePath";
import { RouterManager } from "../../router/RouterManager";

export const Sidebar = () => {
  const { t } = useTranslation("routes");
  const location = useLocation();

  const routes = [
    {
      label: t(RouteName.Assets),
      icon: Briefcase,
      isActive: location.pathname === RoutePath.ASSETS,
      to: RouteName.Assets,
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
      sx={{
        bg: "neutral.50",
        boxShadow: "2px 0px 5px 0px #4141411A",
        position: "relative",
        apply: "textStyles.ElementsRegularXS",
        flexDirection: "column",
        justifyContent: "space-between",
        pt: 20,
        pb: 10,
        w: "104px",
        minW: "104px",
        h: "100vh",
      }}
    />
  );
};
