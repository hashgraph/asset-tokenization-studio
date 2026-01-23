// SPDX-License-Identifier: Apache-2.0

import { Divider, Flex, HStack, Menu, MenuButton } from "@chakra-ui/react";
import { Button, Header as HeaderBase, PhosphorIcon, Text, Logo, Dropdown, DropdownItem } from "io-bricks-ui";
import { useWalletStore } from "../../store/walletStore";
import { useTranslation } from "react-i18next";
import { CaretDown, SignOut, Wallet } from "@phosphor-icons/react";
import { WalletStatus } from "../../utils/constants";
import { useUserStore } from "../../store/userStore";
import { getLayoutBg } from "./helper";

export const Header = () => {
  const { t } = useTranslation("globals");
  const { address, connectionStatus, reset } = useWalletStore();
  const { type: userType } = useUserStore();
  const connected = connectionStatus === WalletStatus.connected;

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
                <DropdownItem label={t("walletDisconnect")} icon={SignOut} onClick={() => reset()} />
              </Dropdown>
            </Menu>
          ) : (
            <></>
            // <Button
            //   size="sm"
            //   isLoading={isLoading}
            //   onClick={() => handleConnectWallet()}
            //   rightIcon={<PhosphorIcon as={Power} />}
            // >
            //   {t("connectMetamask")}
            // </Button>
          )}
          <Divider orientation="vertical" />
          <HStack gap={2}>
            <Text textStyle="ElementsMediumXS">{t(userType)} mode</Text>
          </HStack>
        </Flex>
      }
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
