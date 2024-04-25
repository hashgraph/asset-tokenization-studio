import { Button, HStack, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { CheckboxGroupController } from "@hashgraph/securitytoken-uicomponents";
import { required } from "../../../../utils/rules";
import { SubmitHandler, useForm } from "react-hook-form";
import { ApplyRolesRequest } from "@hashgraph/securitytoken-sdk";
import { useParams } from "react-router-dom";
import { useApplyRoles } from "../../../../hooks/queries/useApplyRoles";
import { rolesList } from "./rolesList";
import { SecurityRole } from "../../../../utils/SecurityRole";
import { Text } from "@hashgraph/securitytoken-uicomponents/Foundations";

interface EditRolesFormValues {
  roles: string[];
}

const COLUMN_WIDTH = 472;
const COLUMN_MAX_WIDTH = `${COLUMN_WIDTH}px`;

export const HandleRoles = ({
  currentRoles,
  address,
}: {
  currentRoles: string[];
  address: string;
}) => {
  const { t: tRoles } = useTranslation("roles");
  const { t: tInputs } = useTranslation("security", {
    keyPrefix: "details.roleManagement.edit.inputs",
  });
  const { t } = useTranslation("security", {
    keyPrefix: "details.roleManagement.edit",
  });
  const { id = "" } = useParams();

  const { mutate: applyRoles, isLoading: isLoadingApply } = useApplyRoles();
  const { handleSubmit: onHandleSubmit, control: controlRoles } =
    useForm<EditRolesFormValues>({
      mode: "onSubmit",
      defaultValues: {
        roles: currentRoles,
      },
    });

  const onSubmitRoles: SubmitHandler<EditRolesFormValues> = (
    params: EditRolesFormValues,
  ) => {
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

  return (
    <VStack
      w={COLUMN_MAX_WIDTH}
      gap={4}
      as="form"
      onSubmit={onHandleSubmit(onSubmitRoles)}
    >
      <HStack h={16} layerStyle="whiteContainer">
        <Text textStyle="HeadingMediumLG">{t("rolesDefinitions")}</Text>
      </HStack>
      <CheckboxGroupController
        control={controlRoles}
        flexDirection={"column"}
        id="roles"
        options={rolesList.map((role) => ({
          value: role.label,
          label: tRoles(role.label),
        }))}
        rules={{ required }}
        variant="roles"
        gap={4}
      />

      <HStack w="full" justify="flex-end">
        <Button
          alignSelf="flex-end"
          size="sm"
          type="submit"
          isLoading={isLoadingApply}
        >
          {tInputs("apply.button")}
        </Button>
      </HStack>
    </VStack>
  );
};
