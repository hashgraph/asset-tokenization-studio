import { Stack } from "@chakra-ui/react";
import { Tabs } from "@hashgraph/uiComponents/DataDisplay/Tabs";
import { useTranslation } from "react-i18next";
import { EditRole } from "./EditRole";
import { SearchByRole } from "./SearchByRole";

export const RoleManagement = () => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.roleManagement.tabs",
  });

  return (
    <Stack w="full" h="full" layerStyle="container">
      <Tabs
        tabs={[
          {
            content: <EditRole />,
            header: tTabs("edit"),
          },
          { content: <SearchByRole />, header: tTabs("search") },
        ]}
        isFitted
      />
    </Stack>
  );
};
