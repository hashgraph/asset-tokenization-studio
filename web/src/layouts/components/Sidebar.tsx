import { Stack } from "@chakra-ui/react";
import {
  Sidebar as BaseSidebar,
  SidebarItem,
} from "@hashgraph/assettokenization-uicomponents/Navigation";
import { ChartPie, House } from "@phosphor-icons/react";
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
              icon={ChartPie}
              onClick={() => RouterManager.to(props.to)}
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
        maxW: "104px",
      }}
    />
  );
};
