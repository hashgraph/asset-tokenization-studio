import { Divider, Flex, HStack, Menu, MenuButton } from "@chakra-ui/react";
import { Button } from "@hashgraph/uiComponents/Interaction";
import { Header as HeaderBase } from "@hashgraph/uiComponents/Navigation";
import { useWalletStore } from "../../store/walletStore";
import { useTranslation } from "react-i18next";
import { CaretDown, Power, SignOut, Wallet } from "@phosphor-icons/react";
import { PhosphorIcon, Text } from "@hashgraph/uiComponents";
import { MetamaskStatus } from "../../utils/constants";
import { Logo } from "@hashgraph/uiComponents/Basic";
import { useUserStore } from "../../store/userStore";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { Dropdown, DropdownItem } from "@hashgraph/uiComponents/DataDisplay";
import { getLayoutBg } from "./helper";

export const Header = () => {
  const { t } = useTranslation("globals");
  const { address, connectionStatus, reset } = useWalletStore();
  const { type: userType } = useUserStore();
  const { handleConnectWallet } = useWalletConnection();
  const connected = connectionStatus === MetamaskStatus.connected;
  const isLoading = connectionStatus === MetamaskStatus.connecting;

  return (
    <HeaderBase
      data-testid="header-layout"
      leftContent={<Logo size="iso" alt="Hedera" height="32px" />}
      rightContent={
        <Flex gap={4} alignItems="center">
          {connected ? (
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                w="180px"
                leftIcon={<PhosphorIcon as={Wallet} />}
                rightIcon={<PhosphorIcon as={CaretDown} />}
                sx={{ _focus: { bg: "primary.500" } }}
              >
                {address}
              </MenuButton>
              <Dropdown w="180px">
                <DropdownItem
                  label={t("walletDisconnect")}
                  icon={SignOut}
                  onClick={() => reset()}
                />
              </Dropdown>
            </Menu>
          ) : (
            <Button
              size="sm"
              isLoading={isLoading}
              onClick={() => handleConnectWallet()}
              rightIcon={<PhosphorIcon as={Power} />}
            >
              {t("connectMetamask")}
            </Button>
          )}
          <Divider orientation="vertical" />
          <HStack gap={2}>
            <Text textStyle="ElementsMediumXS">{t(userType)} mode</Text>
          </HStack>
        </Flex>
      }
      // TODO temporal fix that need to be fixes on IOBricks
      // seems to be that Header does not accept variants
      sx={{
        bg: getLayoutBg[userType],
        h: 16,
        pl: 6,
        pr: 8,
        py: 4,
      }}
    />
  );
};
