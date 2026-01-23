// SPDX-License-Identifier: Apache-2.0

import { IdentityRegistryRequest, SetIdentityRegistryRequest } from "@hashgraph/asset-tokenization-sdk";
import { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Flex } from "@chakra-ui/react";
import { IconButton, InputController, PhosphorIcon, PopUp, Text } from "io-bricks-ui";
import { Pencil, X, Info, Check } from "@phosphor-icons/react";
import { useRolesStore } from "../../../store/rolesStore";
import { SecurityRole } from "../../../utils/SecurityRole";
import { useParams } from "react-router-dom";
import { useGetIdentityRegistry } from "../../../hooks/queries/useIdentityRegistry";
import { useUpdateIdentityRegistry } from "../../../hooks/mutations/useUpdateIdentityRegistry";

export const IdentityRegistryItem = ({ securityId }: { securityId: string }) => {
  const { id = "" } = useParams();
  const { roles: accountRoles } = useRolesStore();

  const { t } = useTranslation("security", {
    keyPrefix: "details.bond.updateIdentityRegistry.toast",
  });

  const { control, reset, handleSubmit } = useForm({
    mode: "onChange",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [showConfirmPopUp, setShowConfirmPopUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: identityRegistry } = useGetIdentityRegistry(
    new IdentityRegistryRequest({
      securityId: id!,
    }),
    {
      enabled: !!id,
    },
  );

  const { mutate: updateIdentityRegistryMutation } = useUpdateIdentityRegistry();

  useEffect(() => {
    reset();
  }, [isEditMode, reset]);

  const onSubmit = (data: FieldValues) => {
    setIsLoading(true);

    const request = new SetIdentityRegistryRequest({
      securityId,
      identityRegistry: data.identityRegistry,
    });

    updateIdentityRegistryMutation(request, {
      onSettled() {
        setShowConfirmPopUp(false);
        setIsLoading(false);
        setIsEditMode(false);
      },
    });
  };

  return (
    <Flex alignItems={"center"} justifyContent={"space-between"} w={"full"} flex={1}>
      <Flex alignItems={"center"} gap={4}>
        {isEditMode && (
          <>
            <InputController
              control={control}
              id="identityRegistry"
              placeholder={identityRegistry}
              backgroundColor="neutral.600"
              size="sm"
              defaultValue={identityRegistry}
            />
            <Flex alignItems={"center"} gap={2}>
              <IconButton
                icon={<PhosphorIcon as={Check} />}
                aria-label="save button"
                size={"sm"}
                onClick={() => {
                  setShowConfirmPopUp(true);
                }}
              />
              <IconButton
                icon={<PhosphorIcon as={X} />}
                aria-label="cancel button"
                size={"sm"}
                onClick={() => setIsEditMode(false)}
              />
            </Flex>
          </>
        )}
        {!isEditMode && (
          <>
            <Text>{identityRegistry}</Text>
            {accountRoles.includes(SecurityRole._TREX_OWNER_ROLE) && identityRegistry !== "0.0.0" && (
              <IconButton
                size={"sm"}
                icon={<PhosphorIcon as={Pencil} />}
                aria-label="edit button"
                variant="secondary"
                onClick={() => setIsEditMode(true)}
              />
            )}
          </>
        )}
      </Flex>

      <PopUp
        id="confirmMaturityDate"
        isOpen={showConfirmPopUp}
        onClose={() => {
          !isLoading && setShowConfirmPopUp(false);
        }}
        closeOnOverlayClick={!isLoading}
        icon={<PhosphorIcon as={Info} size="md" />}
        title={t("title")}
        description={t("subtitle")}
        cancelText={t("cancelButtonText")}
        confirmText={t("confirmButtonText")}
        confirmButtonProps={{
          isLoading: isLoading,
        }}
        onConfirm={() => {
          handleSubmit(onSubmit)();
        }}
        onCancel={() => {
          !isLoading && setShowConfirmPopUp(false);
        }}
      />
    </Flex>
  );
};
