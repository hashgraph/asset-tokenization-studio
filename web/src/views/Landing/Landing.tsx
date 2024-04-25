import { useEffect } from "react";
import {
  Center,
  ListItem,
  Link,
  OrderedList,
  Stack,
  VStack,
  Box,
} from "@chakra-ui/react";
import { PhosphorIcon, Text } from "@hashgraph/securitytoken-uicomponents/Foundations";
import { Button } from "@hashgraph/securitytoken-uicomponents/Interaction";
import landingBackground from "../../assets/layer.png";
import { useWalletStore } from "../../store/walletStore";
import _capitalize from "lodash/capitalize";
import { Trans, useTranslation } from "react-i18next";
import { RouterManager } from "../../router/RouterManager";
import { RouteName } from "../../router/RouteName";
import { PopUp } from "@hashgraph/securitytoken-uicomponents";
import { Wallet } from "@phosphor-icons/react";
import { Weight } from "@hashgraph/securitytoken-uicomponents/Foundations";
import { MetamaskStatus, METAMASK_URL, User } from "../../utils/constants";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { useUserStore } from "../../store/userStore";

export const Landing = () => {
  const { t } = useTranslation("landing");
  const { t: tGlobals } = useTranslation("globals");
  const { t: tConnecting } = useTranslation("landing", {
    keyPrefix: "metamaskPopup.connecting",
  });
  const { t: tUninstalled } = useTranslation("landing", {
    keyPrefix: "metamaskPopup.uninstalled",
  });
  const { connectionStatus, reset } = useWalletStore();
  const { handleConnectWallet } = useWalletConnection();
  const { setType } = useUserStore();

  const handleInstallButton = () => {
    window.open(METAMASK_URL, "_blank");
    reset();
  };

  useEffect(() => {
    const connected = connectionStatus === MetamaskStatus.connected;
    if (connected) {
      RouterManager.to(RouteName.Dashboard);
    }

    const disconnected = connectionStatus === MetamaskStatus.disconnected;
    if (disconnected) {
      setType(User.general);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionStatus]);

  const isLoading = connectionStatus === MetamaskStatus.connecting;
  if (isLoading) {
    return (
      <Center h="full" data-testid="connecting-to-metamask">
        <PopUp isOpen={true} onClose={() => reset()}>
          <PhosphorIcon
            as={Wallet}
            size="md"
            sx={{ color: "primary.500" }}
            weight={Weight.Fill}
          />
          <Text mt={2} textStyle="ElementsMediumMD">
            {tConnecting("title")}
          </Text>
          <Text mt={1} textStyle="ElementsRegularXS">
            {tConnecting("description")}
          </Text>
        </PopUp>
      </Center>
    );
  }

  const uninstalled = connectionStatus === MetamaskStatus.uninstalled;
  if (uninstalled) {
    return (
      <Center h="full" data-testid="install-metamask">
        <PopUp isOpen={true} onClose={() => reset()}>
          <PhosphorIcon
            as={Wallet}
            size="md"
            sx={{ color: "primary.500" }}
            weight={Weight.Fill}
          />
          <Text mt={2} textStyle="ElementsMediumMD">
            {tUninstalled("title")}
          </Text>
          <Text mt={1} textStyle="ElementsRegularXS" w="240px">
            {tUninstalled("description")}
          </Text>
          <Button
            data-testid="install-metamask-extension-button"
            size="md"
            onClick={() => handleInstallButton()}
            color="primary.500"
            mt={6}
          >
            {tUninstalled("button")}
          </Button>
        </PopUp>
      </Center>
    );
  }

  return (
    <Stack
      data-testid="landing-page"
      w="full"
      h="full"
      backgroundImage={`url(${landingBackground})`}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      justifyContent="center"
    >
      <VStack alignItems="flex-start" marginLeft={150}>
        <Text
          data-testid="title"
          textStyle="ElementsSemiboldXL"
          lineHeight="57px"
          fontSize="55px"
          color="neutral.900"
          maxW="470px"
        >
          {`${t("connectYour")} `}
          <Text as="span" color="primary.500">
            {t("Wallet")}
          </Text>
        </Text>
        <Text
          data-testid="subtitle"
          textStyle="ElementsLightLG"
          width="329px"
          my={3}
        >
          {t("welcomeMessage")}
        </Text>
        <Box textStyle="ElementsLightSM">
          <Trans
            t={t}
            i18nKey="instructions"
            components={{
              p: <Text />,
              ol: <OrderedList />,
              li: <ListItem />,
              a: <Link isExternal sx={{ display: "inline" }} />,
            }}
          />
        </Box>

        <Button
          data-testid="connect-to-metamask-landing-button"
          onClick={() => handleConnectWallet()}
          mt={7}
        >
          <Text textStyle="ElementsMediumSM" color="neutral.650">
            {tGlobals("connectMetamask")}
          </Text>
        </Button>
      </VStack>
    </Stack>
  );
};
