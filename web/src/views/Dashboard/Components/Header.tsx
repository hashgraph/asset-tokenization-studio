import { Stack, Flex, VStack } from "@chakra-ui/react";
import { Text } from "@hashgraph/uiComponents/Foundations";
import { useTranslation } from "react-i18next";
import { AddSecurityButton } from "./AddSecurityButton";
import { CreateNewSecurityButton } from "./CreateNewSecurityButton";

export const Header = () => {
  const { t } = useTranslation("dashboard", { keyPrefix: "header" });

  return (
    <Stack gap={5}>
      <VStack alignItems="left" gap={5}>
        <Text textStyle="HeadingBoldXL">{t("title")}</Text>
        <Text textStyle="ElementsSemiboldLG">{t("subtitle")}</Text>
      </VStack>
      <Stack alignItems="right">
        <Flex
          alignItems="flex-end"
          justifyContent="flex-end"
          marginTop={-28}
          gap={4}
        >
          <AddSecurityButton />
          <CreateNewSecurityButton variant="secondary" />
        </Flex>
      </Stack>
    </Stack>
  );
};
