import { Link as RouterLink, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HStack, Menu, MenuButton, VStack } from "@chakra-ui/react";
import { Button } from "@hashgraph/uiComponents/Interaction";
import { RouteName } from "../../../router/RouteName";
import { RouterManager } from "../../../router/RouterManager";
import { PhosphorIcon, Toggle } from "@hashgraph/uiComponents";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { Dropdown, DropdownItem } from "@hashgraph/uiComponents/DataDisplay";
import { Text } from "@hashgraph/uiComponents/Foundations";
import { usePauseSecurity } from "../../../hooks/queries/usePauseSecurity";
import { useUnpauseSecurity } from "../../../hooks/queries/useUnpauseSecurity";
import { PauseRequest } from "@hashgraph/securitytoken-sdk";
import { useGetIsPaused } from "../../../hooks/queries/useGetSecurityDetails";
import { useRolesStore } from "../../../store/rolesStore";
import { SecurityRole } from "../../../utils/SecurityRole";

export const AdminActionsButtons = () => {
  const { t: tButtons } = useTranslation("security", {
    keyPrefix: "details.actions",
  });
  const { id = "" } = useParams();
  const { data: isPaused, refetch } = useGetIsPaused(
    new PauseRequest({ securityId: id }),
  );
  const { roles } = useRolesStore();

  const { mutate: pauseSecurity, isLoading: isPauseLoading } = usePauseSecurity(
    { onSettled: () => refetch() },
  );
  const { mutate: unpauseSecurity, isLoading: isUnpauseLoading } =
    useUnpauseSecurity({ onSettled: () => refetch() });
  const handlePauseToggle = async () => {
    const pauseRequest = new PauseRequest({ securityId: id });
    if (isPaused) {
      unpauseSecurity(pauseRequest);
    } else {
      pauseSecurity(pauseRequest);
    }
  };

  const hasMinterRole = roles.find(
    (role) => role === SecurityRole._ISSUER_ROLE,
  );

  const hasControllerRole = roles.find(
    (role) => role === SecurityRole._CONTROLLER_ROLE,
  );

  const hasPauserRole = roles.find(
    (role) => role === SecurityRole._PAUSER_ROLE,
  );

  // TODO get from SDK the buttons to show depending of account's roles
  return (
    <HStack w="full" justifyContent="flex-end" gap={4}>
      {!isPaused && hasMinterRole && (
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
      {!isPaused && hasControllerRole && (
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
      {(hasControllerRole || hasPauserRole) && (
        <Menu>
          <MenuButton
            data-testid="dropdown-actions-button"
            as={Button}
            size="sm"
            variant="tertiary"
            w={1}
            sx={{ minW: 0 }}
          >
            <PhosphorIcon as={DotsThreeVertical} />
          </MenuButton>
          <Dropdown
            w="146px"
            bg="neutral.dark.300"
            data-testid="dropdown-actions-menu"
          >
            {!isPaused && hasControllerRole ? (
              <DropdownItem
                label={tButtons("forceRedeem")}
                data-testid="force-redeem-button"
                as={RouterLink}
                onClick={() =>
                  RouterManager.to(RouteName.DigitalSecurityForceRedeem, {
                    params: { id },
                  })
                }
              />
            ) : (
              <></>
            )}
            {hasPauserRole ? (
              <VStack mt={2} w="full" align="flex-start" pb="2px">
                <HStack
                  w="full"
                  borderBottomColor="status.error.500"
                  borderBottomWidth="1px"
                  pb={1}
                >
                  <Text
                    textStyle="ElementsRegularXS"
                    color="status.error.500"
                    mt={2}
                  >
                    {tButtons("dangerZone.title")}
                  </Text>
                </HStack>
                <Text textStyle="ElementsRegularXS">
                  {tButtons("dangerZone.subtitle")}
                </Text>
                <HStack w="full" mt="10px">
                  <Toggle
                    data-testid="pauser-button"
                    label={tButtons(
                      `dangerZone.${
                        isPaused ? "buttonInactive" : "buttonActive"
                      }`,
                    )}
                    onChange={() => handlePauseToggle()}
                    isDisabled={isPauseLoading || isUnpauseLoading}
                  />
                </HStack>
              </VStack>
            ) : (
              <></>
            )}
          </Dropdown>
        </Menu>
      )}
    </HStack>
  );
};
