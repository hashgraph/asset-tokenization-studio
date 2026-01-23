// SPDX-License-Identifier: Apache-2.0

import { HStack } from "@chakra-ui/react";
import { Text } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { AddExternalControlButton } from "./AddExternalControlButton";
import { CreateNewExternalControlButton } from "./CreateNewExternalControlButton";

export const Header = () => {
  const { t } = useTranslation("externalControl", { keyPrefix: "list.header" });

  return (
    <HStack gap={5} justifyContent={"space-between"}>
      <Text textStyle="HeadingBoldXL">{t("title")}</Text>
      <HStack gap={4}>
        <AddExternalControlButton />
        <CreateNewExternalControlButton variant="secondary" />
      </HStack>
    </HStack>
  );
};
