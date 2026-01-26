// SPDX-License-Identifier: Apache-2.0

import { HStack } from "@chakra-ui/react";
import { Text } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { CreateNewExternalPauseButton } from "./CreateNewExternalPauseButton";
import { AddExternalPauseButton } from "./AddExternalPauseButton";

export const Header = () => {
  const { t: tHeader } = useTranslation("externalPause", {
    keyPrefix: "list.header",
  });

  return (
    <HStack gap={5} justifyContent={"space-between"}>
      <Text textStyle="HeadingBoldXL">{tHeader("title")}</Text>
      <HStack gap={4}>
        <AddExternalPauseButton />
        <CreateNewExternalPauseButton variant="secondary" />
      </HStack>
    </HStack>
  );
};
