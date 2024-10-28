import {
  GetBondDetailsRequest,
  UpdateMaturityDateRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useUpdateBondMaturityDate } from "../../../hooks/mutations/useUpdateBonMaturityDate";
import { dateToUnixTimestamp } from "../../../utils/format";
import { Flex } from "@chakra-ui/react";
import {
  CalendarInputController,
  IconButton,
  PhosphorIcon,
  PopUp,
  Text,
} from "io-bricks-ui";
import { Pencil, X, Info, Check } from "@phosphor-icons/react";
import { useRolesStore } from "../../../store/rolesStore";
import { SecurityRole } from "../../../utils/SecurityRole";
import { useGetBondDetails } from "../../../hooks/queries/useGetSecurityDetails";
import { useParams } from "react-router-dom";

export const MaturityDateItem = ({ securityId }: { securityId: string }) => {
  const { id = "" } = useParams();
  const { roles: accountRoles } = useRolesStore();

  const { t } = useTranslation("security", {
    keyPrefix: "details.bond.updateMaturityDate.toast",
  });

  const { control, reset, handleSubmit } = useForm({
    mode: "onChange",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [showConfirmPopUp, setShowConfirmPopUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: bondDetailsResponse } = useGetBondDetails(
    new GetBondDetailsRequest({
      bondId: id,
    }),
    {
      retry: false,
    },
  );

  const { mutate: updateMaturityDateMutation } = useUpdateBondMaturityDate();

  useEffect(() => {
    reset();
  }, [isEditMode, reset]);

  if (!bondDetailsResponse || !bondDetailsResponse.maturityDate) {
    return null;
  }

  const { maturityDate } = bondDetailsResponse;

  const onSubmit = (data: FieldValues) => {
    setIsLoading(true);

    const request = new UpdateMaturityDateRequest({
      securityId,
      maturityDate: dateToUnixTimestamp(data.maturityDate),
    });

    updateMaturityDateMutation(request, {
      onSettled() {
        setShowConfirmPopUp(false);
        setIsLoading(false);
        setIsEditMode(false);
      },
    });
  };

  return (
    <Flex
      alignItems={"center"}
      justifyContent={"space-between"}
      w={"full"}
      flex={1}
    >
      <Flex alignItems={"center"} gap={4}>
        {isEditMode && (
          <>
            <CalendarInputController
              control={control}
              id="maturityDate"
              placeholder={new Date(maturityDate).toLocaleDateString()}
              backgroundColor="neutral.600"
              size="sm"
              defaultValue={new Date(maturityDate)}
              fromDate={new Date(maturityDate)}
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
            <Text>
              {new Date(bondDetailsResponse.maturityDate).toLocaleDateString()}
            </Text>
            {accountRoles.includes(SecurityRole._BOND_MANAGER_ROLE) && (
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
