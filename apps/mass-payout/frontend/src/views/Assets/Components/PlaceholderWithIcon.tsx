// SPDX-License-Identifier: Apache-2.0

import { HStack } from "@chakra-ui/react";
import { PhosphorIcon, Weight, Text } from "io-bricks-ui";
import { CalendarBlank } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

export const PlaceholderWithIcon = () => {
  const { t } = useTranslation("assets");

  return (
    <HStack spacing={2} color="neutral.400">
      <PhosphorIcon as={CalendarBlank} size="2xs" weight={Weight.Light} color="inherit" />
      <Text textStyle="ElementsRegularSM">{t("filters.selectByType")}</Text>
    </HStack>
  );
};
