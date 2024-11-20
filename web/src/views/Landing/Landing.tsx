import { useEffect, useState } from "react";
import {
  Box,
  Center,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  HStack,
  Link,
  ListItem,
  OrderedList,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { PhosphorIcon, Text, Weight, Button, PopUp } from "io-bricks-ui";
import landingBackground from "../../assets/layer.png";
import { useWalletStore } from "../../store/walletStore";
import { Trans, useTranslation } from "react-i18next";
import { RouterManager } from "../../router/RouterManager";
import { RouteName } from "../../router/RouteName";
import { Wallet } from "@phosphor-icons/react";
import { METAMASK_URL, WalletStatus, User } from "../../utils/constants";
import { useWalletConnection } from "../../hooks/useWalletConnection";
import { useUserStore } from "../../store/userStore";
import { SupportedWallets } from "@hashgraph/asset-tokenization-sdk";

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
  const { handleConnectWallet: connectWallet } = useWalletConnection();
  const { setType } = useUserStore();
  const [selectedWallet, setSelectedWallet] = useState<SupportedWallets | null>(
    null,
  );

  const handleConnectWallet = (wallet: SupportedWallets) => {
    setSelectedWallet(wallet);
    connectWallet(wallet);
  };

  const handleInstallButton = () => {
    window.open(METAMASK_URL, "_blank");
    reset();
  };

  useEffect(() => {
    const connected = connectionStatus === WalletStatus.connected;
    if (connected) {
      RouterManager.to(RouteName.Dashboard);
    }

    const disconnected = connectionStatus === WalletStatus.disconnected;
    if (disconnected) {
      setType(User.general);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionStatus]);

  const isLoading =
    connectionStatus === WalletStatus.connecting &&
    selectedWallet !== SupportedWallets.HWALLETCONNECT;
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

  const uninstalled = connectionStatus === WalletStatus.uninstalled;
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
        <Box textStyle="ElementsLightSM" width="100%">
          <Accordion allowToggle width="fit-content">
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  {t("showMetamaskInstructions")}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Trans
                  t={t}
                  i18nKey="instructionsMetamask"
                  components={{
                    p: <Text />,
                    ol: <OrderedList />,
                    li: <ListItem />,
                    a: <Link isExternal sx={{ display: "inline" }} />,
                  }}
                />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>

        <HStack spacing={4} mt={7}>
          <Button
            data-testid="connect-to-metamask-landing-button"
            onClick={() => handleConnectWallet(SupportedWallets.METAMASK)}
          >
            <Text textStyle="ElementsMediumSM" color="neutral.650">
              {tGlobals("connectMetamask")}
            </Text>
          </Button>
          <Button
            data-testid="connect-to-hwc-landing-button"
            onClick={() => handleConnectWallet(SupportedWallets.HWALLETCONNECT)}
          >
            <Text textStyle="ElementsMediumSM" color="neutral.650">
              {tGlobals("connectWalletConnect")}
            </Text>
          </Button>
        </HStack>
      </VStack>
    </Stack>
  );
};
