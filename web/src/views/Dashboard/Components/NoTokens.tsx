import { Center, HStack, VStack } from "@chakra-ui/react";
import { Text } from "@hashgraph/uiComponents/Foundations";
import { useTranslation } from "react-i18next";
import { AddSecurityButton } from "./AddSecurityButton";
import { CreateNewSecurityButton } from "./CreateNewSecurityButton";

export const NoTokens = () => {
  const { t } = useTranslation("dashboard", { keyPrefix: "noTokens" });

  return (
    <Center w="full" h="full" bg="neutral.600" p={8}>
      <Center
        w="full"
        h="full"
        bg="neutral.50"
        borderRadius="normal"
        border=" 1px dashed"
        borderColor="neutral.500"
        flexDirection="column"
        gap={6}
      >
        <VStack w="407px" gap={4}>
          <Text data-testid="title" textStyle="HeadingMediumXL">
            {t("title")}
          </Text>
          <Text data-testid="title" textStyle="BodyMediumSM" textAlign="center">
            {t("subTitle")}
          </Text>
        </VStack>
        <HStack gap={6}>
          <AddSecurityButton />
          <CreateNewSecurityButton />
        </HStack>
      </Center>
    </Center>
  );
};
