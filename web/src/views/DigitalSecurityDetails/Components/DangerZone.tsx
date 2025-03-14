import { Divider, HStack, VStack } from "@chakra-ui/react";
import { Text, Toggle } from "io-bricks-ui";
import { useRolesStore } from "../../../store/rolesStore";
import { useMemo } from "react";
import { hasRole } from "../../../utils/helpers";
import { SecurityRole } from "../../../utils/SecurityRole";
import { useParams } from "react-router-dom";
import { useGetIsClearingActivated } from "../../../hooks/queries/useClearingOperations";
import { useGetIsPaused } from "../../../hooks/queries/useGetSecurityDetails";
import {
  ActivateClearingRequest,
  DeactivateClearingRequest,
  IsClearingActivatedRequest,
  PauseRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { usePauseSecurity } from "../../../hooks/queries/usePauseSecurity";
import { useUnpauseSecurity } from "../../../hooks/queries/useUnpauseSecurity";
import {
  useActivateClearing,
  useDeactivateClearing,
} from "../../../hooks/mutations/useClearingOperations";
import { useTranslation } from "react-i18next";

export const DangerZone = () => {
  const { t: tButtons } = useTranslation("security", {
    keyPrefix: "details.actions",
  });

  const { id = "" } = useParams();

  const { roles: accountRoles } = useRolesStore();

  const hasPauserRole = useMemo(
    () => hasRole(accountRoles, SecurityRole._PAUSER_ROLE),
    [accountRoles],
  );

  const hasClearingRole = useMemo(
    () => hasRole(accountRoles, SecurityRole._CLEARING_ROLE),
    [accountRoles],
  );

  const { data: isPaused, refetch } = useGetIsPaused(
    new PauseRequest({ securityId: id }),
  );

  const { data: isClearingActivated, refetch: refetchIsClearingActivated } =
    useGetIsClearingActivated(
      new IsClearingActivatedRequest({ securityId: id }),
    );

  const { mutate: pauseSecurity, isLoading: isPauseLoading } = usePauseSecurity(
    { onSettled: () => refetch() },
  );

  const { mutate: unpauseSecurity, isLoading: isUnpauseLoading } =
    useUnpauseSecurity({ onSettled: () => refetch() });

  const { mutate: activateClearing, isLoading: isActivateClearingLoading } =
    useActivateClearing({ onSettled: () => refetchIsClearingActivated() });

  const { mutate: deactivateClearing, isLoading: isDeactivateClearingLoading } =
    useDeactivateClearing({ onSettled: () => refetchIsClearingActivated() });

  const handlePauseToggle = async () => {
    const pauseRequest = new PauseRequest({ securityId: id });
    if (isPaused) {
      unpauseSecurity(pauseRequest);
    } else {
      pauseSecurity(pauseRequest);
    }
  };

  const handleClearingModeToggle = async () => {
    if (isClearingActivated) {
      const deactivateClearingRequest = new DeactivateClearingRequest({
        securityId: id,
      });
      deactivateClearing(deactivateClearingRequest);
    } else {
      const activateClearingRequest = new ActivateClearingRequest({
        securityId: id,
      });
      activateClearing(activateClearingRequest);
    }
  };

  return (
    <VStack w={"full"} layerStyle="container" align="start" gap={8} py={8}>
      {hasPauserRole && (
        <HStack w={"full"} justifyContent={"space-between"}>
          <VStack align="start">
            <Text textStyle="ElementsSemiboldLG">
              {tButtons("dangerZone.pauseSecurityTokenTitle")}
            </Text>
            <Text textStyle="BodyRegularSM">
              {tButtons("dangerZone.pauseSecurityTokenDescription")}
            </Text>
          </VStack>
          <Toggle
            data-testid="pauser-button"
            size={"lg"}
            defaultChecked={isPaused}
            onChange={handlePauseToggle}
            isDisabled={isPauseLoading || isUnpauseLoading}
          />
        </HStack>
      )}
      {hasClearingRole && hasPauserRole && <Divider bgColor={"neutral.500"} />}
      {hasClearingRole && (
        <HStack w={"full"} justifyContent={"space-between"}>
          <VStack align="start">
            <Text textStyle="ElementsSemiboldLG">
              {tButtons("dangerZone.clearingModeTitle")}
            </Text>
            <Text textStyle="BodyRegularSM">
              {tButtons("dangerZone.clearingModeDescription")}
            </Text>
          </VStack>
          <Toggle
            data-testid="pauser-button"
            size={"lg"}
            defaultChecked={isClearingActivated}
            onChange={handleClearingModeToggle}
            isDisabled={
              isActivateClearingLoading ||
              isDeactivateClearingLoading ||
              isPaused
            }
          />
        </HStack>
      )}
    </VStack>
  );
};
