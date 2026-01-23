// SPDX-License-Identifier: Apache-2.0

import { Center, Heading, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export const Landing = () => {
  const { t } = useTranslation();

  return (
    <Center bg="#F8F7FC" w="full" h="full">
      <VStack spacing={6} align="center">
        <Heading as="h1" size="2xl">
          {t("app.title")}
        </Heading>
        <Text fontSize="xl">{t("app.description")}</Text>
      </VStack>
    </Center>
  );
};
