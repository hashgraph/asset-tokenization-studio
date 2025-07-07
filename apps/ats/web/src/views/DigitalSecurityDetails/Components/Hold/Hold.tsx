import { Stack } from "@chakra-ui/react";
import { Tabs } from "io-bricks-ui";
import { HoldList } from "./HoldList";
import { HoldCreate } from "./HoldCreate";
import { useTranslation } from "react-i18next";
import { HoldManage } from "./HoldManage";

export const Hold = () => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.hold.tabs",
  });

  return (
    <Stack w="full" h="full" layerStyle="container">
      <Tabs
        variant="secondary"
        tabs={[
          {
            content: <HoldList />,
            header: tTabs("list"),
          },
          { content: <HoldCreate />, header: tTabs("create") },
          { content: <HoldManage />, header: tTabs("manage") },
        ]}
        isFitted
      />
    </Stack>
  );
};
