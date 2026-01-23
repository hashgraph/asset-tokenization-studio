// SPDX-License-Identifier: Apache-2.0

import { ComplianceRequest, SetComplianceRequest } from "@hashgraph/asset-tokenization-sdk";
import { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Flex } from "@chakra-ui/react";
import { IconButton, InputController, PhosphorIcon, PopUp, Text } from "io-bricks-ui";
import { Pencil, X, Info, Check } from "@phosphor-icons/react";
import { useRolesStore } from "../../../store/rolesStore";
import { SecurityRole } from "../../../utils/SecurityRole";
import { useParams } from "react-router-dom";
import { useUpdateCompliance } from "../../../hooks/mutations/useUpdateCompliance";
import { useGetCompliance } from "../../../hooks/queries/useCompliance";

export const ComplianceItem = ({ securityId }: { securityId: string }) => {
  const { id = "" } = useParams();
  const { roles: accountRoles } = useRolesStore();

  const { t } = useTranslation("security", {
    keyPrefix: "details.bond.updateCompliance.toast",
  });

  const { control, reset, handleSubmit } = useForm({
    mode: "onChange",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [showConfirmPopUp, setShowConfirmPopUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: compliance } = useGetCompliance(
    new ComplianceRequest({
      securityId: id!,
    }),
    {
      enabled: !!id,
    },
  );

  const { mutate: updateComplianceMutation } = useUpdateCompliance();

  useEffect(() => {
    reset();
  }, [isEditMode, reset]);

  const onSubmit = (data: FieldValues) => {
    setIsLoading(true);

    const request = new SetComplianceRequest({
      securityId,
      compliance: data.compliance,
    });

    updateComplianceMutation(request, {
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
              id="compliance"
              placeholder={compliance}
              backgroundColor="neutral.600"
              size="sm"
              defaultValue={compliance}
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
            <Text>{compliance}</Text>
            {accountRoles.includes(SecurityRole._TREX_OWNER_ROLE) && compliance !== "0.0.0" && (
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
