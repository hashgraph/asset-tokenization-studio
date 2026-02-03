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

export const AdminActionsButtons = () => {
  const { t: tButtons } = useTranslation("security", {
    keyPrefix: "details.actions",
  });
  const { id = "" } = useParams();
  const { data: isPaused } = useGetIsPaused(new PauseRequest({ securityId: id }));
  const { roles } = useRolesStore();

  const hasMinterRole = roles.find((role) => role === SecurityRole._ISSUER_ROLE);

  const hasControllerRole = roles.find((role) => role === SecurityRole._CONTROLLER_ROLE);

  if (isPaused || (!hasControllerRole && !hasMinterRole)) return null;

  return (
    <HStack w="full" justifyContent="flex-end" gap={4}>
      {hasMinterRole && (
        <Button
          data-testid="mint-button"
          as={RouterLink}
          to={RouterManager.getUrl(RouteName.DigitalSecurityMint, {
            params: { id },
          })}
          variant="secondary"
        >
          {tButtons("mint")}
        </Button>
      )}
      {hasControllerRole && (
        <Button
          data-testid="force-transfer-button"
          as={RouterLink}
          to={RouterManager.getUrl(RouteName.DigitalSecurityForceTransfer, {
            params: { id },
          })}
          variant="secondary"
        >
          {tButtons("forceTransfer")}
        </Button>
      )}
      {hasControllerRole && (
        <Button
          data-testid="force-redeem-button"
          as={RouterLink}
          to={RouterManager.getUrl(RouteName.DigitalSecurityForceRedeem, {
            params: { id },
          })}
          variant="secondary"
        >
          {tButtons("forceRedeem")}
        </Button>
      )}
    </HStack>
  );
};
