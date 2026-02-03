// SPDX-License-Identifier: Apache-2.0

import { Button, HStack, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Checkbox, CheckboxGroupController, Text } from "io-bricks-ui";
import { required } from "../../../../utils/rules";
import { SubmitHandler, useForm } from "react-hook-form";
import { ApplyRolesRequest } from "@hashgraph/asset-tokenization-sdk";
import { useParams } from "react-router-dom";
import { useApplyRoles } from "../../../../hooks/queries/useApplyRoles";
import { rolesList, TSecurityType } from "./rolesList";
import { SecurityRole } from "../../../../utils/SecurityRole";
import { useSecurityStore } from "../../../../store/securityStore";

interface EditRolesFormValues {
  roles: string[];
}

const COLUMN_WIDTH = 472;
const COLUMN_MAX_WIDTH = `${COLUMN_WIDTH}px`;

export const HandleRoles = ({ currentRoles, address }: { currentRoles: string[]; address: string }) => {
  const { t: tRoles } = useTranslation("roles");
  const { t: tInputs } = useTranslation("security", {
    keyPrefix: "details.roleManagement.edit.inputs",
  });
  const { t } = useTranslation("security", {
    keyPrefix: "details.roleManagement.edit",
  });
  const { details: securityDetails } = useSecurityStore();

  const { id = "" } = useParams();

  const { mutate: applyRoles, isLoading: isLoadingApply } = useApplyRoles();
  const {
    handleSubmit: onHandleSubmit,
    control: controlRoles,
    watch,
    setValue,
  } = useForm<EditRolesFormValues>({
    mode: "onSubmit",
    defaultValues: {
      roles: currentRoles,
    },
  });

  const onSubmitRoles: SubmitHandler<EditRolesFormValues> = (params: EditRolesFormValues) => {
    const roles: SecurityRole[] = [];
    const actives: boolean[] = [];
    rolesList.forEach((role) => {
      roles.push(role.value);
      actives.push(params.roles.includes(role.label));
    });

    const request = new ApplyRolesRequest({
      securityId: id,
      targetId: address,
      roles,
      actives,
    });

    applyRoles(request);
  };

  const roleListAvailable = rolesList.filter((role) => {
    if (!securityDetails) return role;

    return role.allowedSecurities.includes(securityDetails.type as TSecurityType);
  });

  const handleSelectAllRoles = () => {
    if (allRolesSelected) {
      setValue("roles", currentRoles.length === roleListAvailable.length ? [] : currentRoles);
      return;
    }

    const allRoleValues = roleListAvailable.map((role) => role.label);
    setValue("roles", allRoleValues);
  };

  const allRolesSelected = watch("roles").length === roleListAvailable.length;

  return (
    <VStack w={COLUMN_MAX_WIDTH} gap={4} as="form" onSubmit={onHandleSubmit(onSubmitRoles)}>
      <HStack h={16} layerStyle="whiteContainer">
        <Text textStyle="HeadingMediumLG">{t("rolesDefinitions")}</Text>
      </HStack>
      <VStack w="full" gap={2}>
        <HStack bgColor="white" w="full" p={4} cursor="pointer" onClick={handleSelectAllRoles}>
          <Checkbox id="selectAllRoles" isChecked={allRolesSelected} onChange={handleSelectAllRoles} />
          <Text textStyle="BodyRegularXS">{t("selectAllRoles")}</Text>
        </HStack>
        <CheckboxGroupController
          control={controlRoles}
          flexDirection={"column"}
          id="roles"
          options={roleListAvailable.map((role) => ({
            value: role.label,
            label: tRoles(role.label),
          }))}
          rules={{ required }}
          variant="roles"
          gap={4}
        />
      </VStack>

      <HStack w="full" justify="flex-end">
        <Button alignSelf="flex-end" size="sm" type="submit" isLoading={isLoadingApply}>
          {tInputs("apply.button")}
        </Button>
      </HStack>
    </VStack>
  );
};
