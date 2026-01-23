// SPDX-License-Identifier: Apache-2.0

import { Link as RouterLink, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HStack } from "@chakra-ui/react";
import { Button } from "io-bricks-ui";
import { RouteName } from "../../../router/RouteName";
import { RouterManager } from "../../../router/RouterManager";
import { PauseRequest } from "@hashgraph/asset-tokenization-sdk";
import { useGetIsPaused } from "../../../hooks/queries/useGetSecurityDetails";
import { useRolesStore } from "../../../store/rolesStore";
import { SecurityRole } from "../../../utils/SecurityRole";

export const AdminControlActionsButtons = () => {
  const { t: tButtons } = useTranslation("security", {
    keyPrefix: "details.actions",
  });
  const { id = "" } = useParams();
  const { data: isPaused } = useGetIsPaused(new PauseRequest({ securityId: id }));
  const { roles } = useRolesStore();

  const hasFreezeRole = roles.find((role) => role === SecurityRole._FREEZE_MANAGER_ROLE);

  if (isPaused || !hasFreezeRole) return null;

  return (
    <HStack w="full" justifyContent="flex-end" gap={4} pb={6}>
      {hasFreezeRole && (
        <Button
          data-testid="freeze-button"
          as={RouterLink}
          to={RouterManager.getUrl(RouteName.DigitalSecurityFreeze, {
            params: { id },
          })}
          variant="secondary"
        >
          {tButtons("freeze")}
        </Button>
      )}
    </HStack>
  );
};
