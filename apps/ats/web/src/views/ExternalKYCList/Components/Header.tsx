// SPDX-License-Identifier: Apache-2.0

import { HStack } from "@chakra-ui/react";
import { Text } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { AddExternalKYCButton } from "./AddExternalKYCButton";
import { CreateNewExternalKYCButton } from "./CreateNewExternalKYCButton";

export const Header = () => {
  const { t } = useTranslation("externalKYC", { keyPrefix: "list.header" });

  return (
    <HStack gap={5} justifyContent={"space-between"}>
      <Text textStyle="HeadingBoldXL">{t("title")}</Text>
      <HStack gap={4}>
        <AddExternalKYCButton />
        <CreateNewExternalKYCButton variant="secondary" />
      </HStack>
    </HStack>
  );
};
