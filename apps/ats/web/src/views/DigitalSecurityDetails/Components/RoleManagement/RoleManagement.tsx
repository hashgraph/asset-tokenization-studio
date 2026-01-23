// SPDX-License-Identifier: Apache-2.0

import { Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { EditRole } from "./EditRole";
import { SearchByRole } from "./SearchByRole";
import { PanelTabs } from "../../../../components/PanelTabs/PanelTabs";

export const RoleManagement = () => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.roleManagement.tabs",
  });

  return (
    <Stack w="full" h="full" layerStyle="container" p={0}>
      <PanelTabs
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
