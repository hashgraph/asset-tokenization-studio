import { Stack } from "@chakra-ui/react";
import { Tabs } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { ClearingOperationsList } from "./ClearingOperationList";
import { ClearingOperationsCreate } from "./ClearingOperationCreate";
import { ClearingOperationsManage } from "./ClearingOperationManage";

export const ClearingOperations = () => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.tabs",
  });

  return (
    <Stack w="full" h="full" layerStyle="container">
      <Tabs
        tabs={[
          {
            content: <ClearingOperationsList />,
            header: tTabs("list"),
          },
          { content: <ClearingOperationsCreate />, header: tTabs("create") },
          { content: <ClearingOperationsManage />, header: tTabs("manage") },
        ]}
        isFitted
      />
    </Stack>
  );
};
