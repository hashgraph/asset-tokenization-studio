import { Center, Stack, StackProps } from "@chakra-ui/react";
import { Button } from "@hashgraph/securitytoken-uicomponents/Interaction";
import { PhosphorIcon } from "@hashgraph/securitytoken-uicomponents";
import { Plus } from "@phosphor-icons/react";
import { Text } from "@hashgraph/securitytoken-uicomponents/Foundations";
import { useTranslation } from "react-i18next";
import { RouteName } from "../../../router/RouteName";
import { RouterManager } from "../../../router/RouterManager";
import { User } from "../../../utils/constants";
export interface AddFavoriteProps extends StackProps {
  isAdmin: boolean;
}

export const AddFavorite = (props: AddFavoriteProps) => {
  const { isAdmin, ...stackProps } = props;
  const { t } = useTranslation("dashboard", { keyPrefix: "commons" });

  return (
    <Stack
      as={Button}
      data-testid="add-favorite-button"
      w="full"
      h="144px"
      bg={isAdmin ? "adminUI.100" : "holderUI.100"}
      borderRadius="normal"
      borderStyle="dashed"
      borderWidth="1px"
      borderColor={isAdmin ? "adminUI.400" : "holderUI.400"}
      p={4}
      onClick={() =>
        RouterManager.to(RouteName.DigitalSecuritiesList, {
          params: { type: isAdmin ? User.admin : User.holder },
        })
      }
      _hover={{ bg: isAdmin ? "adminUI.200" : "holderUI.200" }}
      {...stackProps}
    >
      <Center w="full" h="full" gap={2}>
        <PhosphorIcon as={Plus} size="xs" fill="neutral.900" />
        <Text textStyle="ElementsRegularSM" color="neutral.900">
          {t("addFavorite")}
        </Text>
      </Center>
    </Stack>
  );
};
