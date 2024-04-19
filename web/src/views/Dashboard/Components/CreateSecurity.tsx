import { HStack, Stack, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { History } from "../../../components/History";
import { RouteName } from "../../../router/RouteName";
import { CardButton, Heading, PhosphorIcon, Text } from "@iob/io-bricks-ui";
import { Link as RouterLink } from "react-router-dom";
import { RouterManager } from "../../../router/RouterManager";
import { DiamondsFour, CodesandboxLogo } from "@phosphor-icons/react";

export const CreateSecurity = () => {
  const { t } = useTranslation("security", { keyPrefix: "createSecurity" });
  const { t: tRoutes } = useTranslation("routes");

  return (
    <>
      <Stack gap={6} h="full">
        <History label={tRoutes(RouteName.CreateSecurity)} />

        <Stack layerStyle="container" align="center" h="full">
          <VStack maxW="440px" align="flex-start" p={6} gap={4}>
            <Heading textStyle="HeadingMediumLG">{t("title")}</Heading>
            <Text textStyle="BodyRegularMD">{t("subtitle")}</Text>

            <HStack padding={20} gap={6}>
              <CardButton
                data-testid="create-bond"
                as={RouterLink}
                to={RouterManager.getUrl(RouteName.CreateBond)}
                icon={<PhosphorIcon as={DiamondsFour} />}
                text={t("button.newBond")}
                variant="secondary"
                textAlign="center"
              />
              <CardButton
                data-testid="create-equity"
                as={RouterLink}
                to={RouterManager.getUrl(RouteName.CreateEquity)}
                icon={<PhosphorIcon as={CodesandboxLogo} />}
                text={t("button.newEquity")}
                variant="secondary"
                textAlign="center"
              />
            </HStack>
          </VStack>
        </Stack>
      </Stack>
    </>
  );
};
