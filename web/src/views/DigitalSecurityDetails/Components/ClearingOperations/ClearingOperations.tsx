import { Stack } from "@chakra-ui/react";
import { Tabs } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { ClearingOperationsList } from "./ClearingOperationList";
import { ClearingOperationsCreate } from "./ClearingOperationCreate";
import { ClearingOperationsManage } from "./ClearingOperationManage";
import { useRolesStore } from "../../../../store/rolesStore";
import { SecurityRole } from "../../../../utils/SecurityRole";

export const ClearingOperations = () => {
  const { t: tTabs } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.tabs",
  });

  const { roles } = useRolesStore();

  const hasClearingValidatorRole = roles.find(
    (role) => role === SecurityRole._CLEARING_VALIDATOR_ROLE,
  );

  const tabs = [
    {
      content: <ClearingOperationsList />,
      header: tTabs("list"),
    },
    { content: <ClearingOperationsCreate />, header: tTabs("create") },
  ];

  if (hasClearingValidatorRole) {
    tabs.push({
      content: <ClearingOperationsManage />,
      header: tTabs("manage"),
    });
  }

  return (
    <Stack w="full" h="full" layerStyle="container">
      <Tabs tabs={tabs} isFitted />
    </Stack>
  );
};
