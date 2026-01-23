// SPDX-License-Identifier: Apache-2.0

import { HStack, StackProps } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { AddSecurityButton } from "../views/Dashboard/Components/AddSecurityButton";
import { CreateNewSecurityButton } from "../views/Dashboard/Components/CreateNewSecurityButton";
import { History } from "./History";

export interface HeaderProps extends StackProps {
  label?: string;
  page: string;
}

export const Header = ({ label, page }: HeaderProps) => {
  const { t } = useTranslation(page, { keyPrefix: "header" });

  return (
    <HStack justifyContent="space-between">
      <History label={label ?? t("title")} />
      <HStack gap={4} alignContent={"flex-start"} justifyContent="flex-end" alignSelf="flex-start">
        <AddSecurityButton />
        <CreateNewSecurityButton variant="secondary" />
      </HStack>
    </HStack>
  );
};
