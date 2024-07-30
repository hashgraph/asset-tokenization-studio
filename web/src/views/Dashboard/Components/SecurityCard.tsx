import { HStack, Stack, StackProps, VStack } from "@chakra-ui/react";
import {
  PhosphorIcon,
  Weight,
} from "@hashgraph/assettokenization-uicomponents";
import { Star } from "@phosphor-icons/react";
import { Text } from "@hashgraph/assettokenization-uicomponents/Foundations";
import { SecurityStore } from "../../../store/securityStore";
import { useWalletStore } from "../../../store/walletStore";
import { useAccountStore } from "../../../store/accountStore";
import { RouterManager } from "../../../router/RouterManager";
import { RouteName } from "../../../router/RouteName";
import { Link as RouterLink } from "react-router-dom";
import { useUserStore } from "../../../store/userStore";
import { User } from "../../../utils/constants";

export interface SecurityProps extends StackProps {
  isAdmin: boolean;
  digitalSecurity: SecurityStore;
}

export const SecurityCard = (props: SecurityProps) => {
  const { digitalSecurity, isAdmin, ...stackProps } = props;
  const { address, name, symbol, type } = digitalSecurity;
  const { address: walletAddress } = useWalletStore();
  const { toggleAdminFavorite, toggleHolderFavorite } = useAccountStore();
  const { setType } = useUserStore();

  const handleClickOnFavorite = () => {
    isAdmin
      ? toggleAdminFavorite(walletAddress, address)
      : toggleHolderFavorite(walletAddress, address);
  };

  return (
    <Stack
      w="full"
      h="144px"
      bg={isAdmin ? "adminUI.100" : "holderUI.100"}
      borderRadius="normal"
      p={4}
      as={RouterLink}
      to={RouterManager.getUrl(RouteName.DigitalSecurityDetails, {
        params: { id: address },
      })}
      onClick={() => setType(isAdmin ? User.admin : User.holder)}
      {...stackProps}
    >
      <VStack alignItems={"flex-start"} w="full">
        <HStack w="full" justify="space-between">
          <Text
            textStyle="ElementsRegularSM"
            color="neutral.900"
            textTransform="capitalize"
          >
            {type?.toLowerCase()}
          </Text>
          <PhosphorIcon
            as={Star}
            weight={Weight.Fill}
            onClick={(e) => {
              e.preventDefault();
              handleClickOnFavorite();
            }}
            sx={{ color: "neutral.white" }}
          />
        </HStack>
        <Text textStyle="ElementsSemiboldMD">
          {symbol} {name}
        </Text>
      </VStack>
    </Stack>
  );
};
