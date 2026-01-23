// SPDX-License-Identifier: Apache-2.0

import { Button, HStack, Stack, VStack } from "@chakra-ui/react";
import { Text, useToast, SearchInputController } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { required, isValidHederaId } from "../../../../utils/rules";
import { useForm } from "react-hook-form";
import { SecurityDetails } from "../SecurityDetails";
import { GetRolesForRequest } from "@hashgraph/asset-tokenization-sdk";
import { useGetSecurityRolesFor } from "../../../../hooks/queries/useGetSecurityDetails";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { rolesList } from "./rolesList";
import { HandleRoles } from "./HandleRoles";

interface FieldValue {
  address: string;
}

const COLUMNS_GAP = 65;
const COLUMN_WIDTH = 472;
const COLUMN_MAX_WIDTH = `${COLUMN_WIDTH}px`;
const TITLE_WIDTH = `${COLUMN_WIDTH * 2 + COLUMNS_GAP}px`;

export const EditRole = () => {
  const { t: tInputs } = useTranslation("security", {
    keyPrefix: "details.roleManagement.edit.inputs",
  });
  const { t } = useTranslation("security", {
    keyPrefix: "details.roleManagement.edit",
  });

  const { id = "" } = useParams();
  const [currentRoles, setCurrentRoles] = useState<string[] | null>(null);
  const toast = useToast();

  // Search Roles
  const {
    control: searchControl,
    formState: { isValid: isSearchValid },
    handleSubmit: searchHandleSubmit,
    watch,
  } = useForm<FieldValue>({
    mode: "onSubmit",
  });

  const addressToSearch = watch("address");

  // GET ROLES
  const { refetch, isFetching: isSearchFetching } = useGetSecurityRolesFor(
    new GetRolesForRequest({
      securityId: id,
      targetId: addressToSearch ?? "",
      start: 0,
      end: 1000,
    }),
    {
      enabled: false,
      refetchOnMount: false,
      onSuccess: (data) => {
        handleCurrentRoles(data);
        toast.show({ duration: 3000, title: "Roles found", status: "success" });
      },
      onError: () => {
        toast.show({
          duration: 3000,
          title: "Roles not found",
          status: "error",
        });
      },
    },
  );

  const handleCurrentRoles = (roles: string[]) => {
    const currentRoles: string[] = [];

    rolesList.map((rol) => {
      if (roles.includes(rol.value)) {
        currentRoles.push(rol.label);
      }
    });

    setCurrentRoles(currentRoles);
  };

  const searchOnSubmit = () => {
    setCurrentRoles(null);
    refetch();
  };

  return (
    <VStack gap={12} w="auto" pt="72px">
      <VStack alignItems="flex-start" justifyContent="flex-start" gap={4} w={TITLE_WIDTH} minW={COLUMN_WIDTH}>
        <Text textStyle="HeadingMediumLG">{t("title")}</Text>
        <Text textStyle="BodyTextRegularMD">{t("subtitle")}</Text>
      </VStack>
      <HStack gap={`${COLUMNS_GAP}px`} justify="center" align="flex-start">
        <VStack gap={10}>
          <VStack w={COLUMN_MAX_WIDTH} gap={4}>
            {/* SEARCH FORM  */}
            <VStack w="full">
              <HStack w="full" gap={6} as="form" onSubmit={searchHandleSubmit(searchOnSubmit)} alignItems="flex-start">
                <Stack w="320px">
                  <SearchInputController
                    id="address"
                    placeholder={tInputs("search.placeholder")}
                    onSearch={() => {}}
                    control={searchControl}
                    size="sm"
                    rules={{
                      required,
                      validate: { isValidHederaId: isValidHederaId },
                    }}
                  />
                </Stack>
                <Button size="sm" isDisabled={!isSearchValid} isLoading={isSearchFetching} type="submit">
                  {tInputs("search.button")}
                </Button>
              </HStack>
            </VStack>
          </VStack>
          <VStack gap={4}>
            {currentRoles && <HandleRoles currentRoles={currentRoles} address={addressToSearch} />}
          </VStack>
        </VStack>
        <Stack w={COLUMN_MAX_WIDTH}>
          <SecurityDetails layerStyle="whiteContainer" />
        </Stack>
      </HStack>
    </VStack>
  );
};
