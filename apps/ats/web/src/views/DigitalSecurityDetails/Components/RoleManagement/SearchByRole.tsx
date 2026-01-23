// SPDX-License-Identifier: Apache-2.0

import { Button, HStack, Stack, VStack } from "@chakra-ui/react";
import { Text, DefinitionList, SelectController } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { required } from "../../../../utils/rules";
import { useForm } from "react-hook-form";
import { SecurityDetails } from "../SecurityDetails";
import { useGetRoleMemberCount, useGetRoleMembers } from "../../../../hooks/queries/useGetSecurityDetails";
import { GetRoleMemberCountRequest, GetRoleMembersRequest } from "@hashgraph/asset-tokenization-sdk";
import { useParams } from "react-router-dom";
import { rolesList, TSecurityType } from "./rolesList";
import { useEffect, useState } from "react";
import { SecurityRole } from "../../../../utils/SecurityRole";
import { useSecurityStore } from "../../../../store/securityStore";

interface SearchByRoleFieldValue {
  role: { label: string; value: SecurityRole };
}

const COLUMNS_GAP = 65;
const COLUMN_WIDTH = 472;
const COLUMN_MAX_WIDTH = `${COLUMN_WIDTH}px`;
const TITLE_WIDTH = `${COLUMN_WIDTH * 2 + COLUMNS_GAP}px`;

export const SearchByRole = () => {
  const { t: tProperties } = useTranslation("properties");
  const { t: tRoles } = useTranslation("roles");
  const { t: tInputs } = useTranslation("security", {
    keyPrefix: "details.roleManagement.search.inputs",
  });
  const { t } = useTranslation("security", {
    keyPrefix: "details.roleManagement.search",
  });
  const { id = "" } = useParams();
  const { details: securityDetails } = useSecurityStore();

  const [roleToSearch, setRoleToSearch] = useState<string>();
  const [isRoleMemberCountLoading, setIsRoleMemberCountLoading] = useState<boolean>(false);
  const [isRoleMembersLoading, setIsRoleMembersLoading] = useState<boolean>(false);

  const {
    control,
    formState: { isValid },
    handleSubmit,
    watch,
  } = useForm<SearchByRoleFieldValue>({
    mode: "onSubmit",
  });
  const role = watch("role");

  const roleMemberCountRequest = new GetRoleMemberCountRequest({
    securityId: id,
    role: roleToSearch ?? "",
  });

  const { data: roleMemberCount, refetch: refetchRoleMemberCount } = useGetRoleMemberCount(roleMemberCountRequest, {
    enabled: false,
    onSuccess: (data) => console.log("COUNT ", data),
    onError: (error) => console.error("ERROR", error),
    onSettled: () => setIsRoleMemberCountLoading(false),
  });

  const roleMembersRequest = new GetRoleMembersRequest({
    securityId: id,
    role: roleToSearch ?? "",
    start: 0,
    end: roleMemberCount ?? 0,
  });
  const { data: roleMembers, refetch: refetchRoleMembers } = useGetRoleMembers(roleMembersRequest, {
    enabled: false,
    onSettled: () => setIsRoleMembersLoading(false),
  });

  useEffect(() => {
    if (roleToSearch) {
      refetchRoleMemberCount();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleToSearch]);

  useEffect(() => {
    if (roleMemberCount) {
      setIsRoleMembersLoading(true);
      refetchRoleMembers();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleMemberCount]);

  const onSubmit = ({ role }: SearchByRoleFieldValue) => {
    setIsRoleMemberCountLoading(true);
    setRoleToSearch(role.value);
  };

  return (
    <VStack gap={12} w="auto" pt="72px">
      <VStack alignItems="flex-start" justifyContent="flex-start" gap={4} w={TITLE_WIDTH} minW={COLUMN_WIDTH}>
        <Text textStyle="HeadingMediumLG">{t("title")}</Text>
        <Text textStyle="BodyTextRegularMD">{t("subtitle")}</Text>
      </VStack>
      <HStack gap={`${COLUMNS_GAP}px`} justify="center" align="flex-start">
        <VStack gap="90px" w={COLUMN_MAX_WIDTH}>
          <VStack w="full">
            <HStack w="full" gap={6} as="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack w="320px">
                <SelectController
                  id="role"
                  control={control}
                  options={rolesList
                    .filter((role) => {
                      if (!securityDetails) return role;

                      return role.allowedSecurities.includes(securityDetails.type as TSecurityType);
                    })
                    .map((role) => ({
                      value: role.value,
                      label: tRoles(role.label),
                    }))}
                  size="sm"
                  setsFullOption
                  rules={{ required }}
                  onChange={() => {
                    setIsRoleMemberCountLoading(false);
                    setIsRoleMembersLoading(false);
                  }}
                  {...tInputs("select", { returnObjects: true })}
                />
              </Stack>
              <Button
                data-testid="select-role-button"
                alignSelf="flex-end"
                size="sm"
                isDisabled={!isValid}
                type="submit"
                isLoading={isRoleMemberCountLoading || isRoleMembersLoading}
              >
                {tInputs("select.button")}
              </Button>
            </HStack>
          </VStack>
          {roleMemberCount === 0 && !isRoleMemberCountLoading && (
            <Stack layerStyle="whiteContainer">
              <Text textStyle="BodyTextRegularMD">{t("noRoles")}</Text>
            </Stack>
          )}
          {roleMembers && (
            <DefinitionList
              items={roleMembers.map((account) => ({
                title: tProperties("id"),
                description: account,
                canCopy: true,
              }))}
              title={t("role", { role: role.label })}
              layerStyle="whiteContainer"
              maxH="485px"
              overflowY="auto"
            />
          )}
        </VStack>
        <Stack w={COLUMN_MAX_WIDTH}>
          <SecurityDetails layerStyle="whiteContainer" />
        </Stack>
      </HStack>
    </VStack>
  );
};
