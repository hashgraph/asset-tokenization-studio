// SPDX-License-Identifier: Apache-2.0

import { Flex, HStack, Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { PhosphorIcon, Text, Table, Button, InputController } from "io-bricks-ui";
import { CancelButton } from "../../../components/CancelButton";
import { NextStepButton } from "./NextStepButton";
import { PreviousStepButton } from "./PreviousStepButton";
import { ICreateBondFormValues } from "../ICreateBondFormValues";
import { useFormContext, useFormState, useForm } from "react-hook-form";
import { FormStepContainer } from "../../../components/FormStepContainer";
import { Trash } from "@phosphor-icons/react";
import { createColumnHelper } from "@tanstack/table-core";
import { isValidHederaId, required } from "../../../utils/rules";

interface IProceedRecipient {
  address: string;
  data?: string;
}

interface ILocalProceedRecipientForm {
  address: string;
  data?: string;
}

export const StepProceedRecipients = () => {
  const { t } = useTranslation("security", { keyPrefix: "createBond" });
  const { control, watch, setValue } = useFormContext<ICreateBondFormValues>();
  const stepFormState = useFormState({ control });

  const {
    control: localControl,
    handleSubmit: handleLocalSubmit,
    reset: resetLocalForm,
    formState: localFormState,
  } = useForm<ILocalProceedRecipientForm>({
    defaultValues: {
      address: "",
      data: "",
    },
    mode: "onChange",
  });

  const currentProceedRecipientsIds = watch("proceedRecipientsIds") || [];
  const currentProceedRecipientsData = watch("proceedRecipientsData") || [];

  const proceedRecipients: IProceedRecipient[] = currentProceedRecipientsIds.map((address, index) => ({
    address,
    data: currentProceedRecipientsData[index] || "",
  }));

  const handleAddProceedRecipient = handleLocalSubmit((data) => {
    const newProceedRecipientsIds = [...currentProceedRecipientsIds, data.address.trim()];
    const newProceedRecipientsData = [...currentProceedRecipientsData, data?.data?.trim() ?? ""];

    setValue("proceedRecipientsIds", newProceedRecipientsIds);
    setValue("proceedRecipientsData", newProceedRecipientsData);

    resetLocalForm();
  });

  const handleRemoveProceedRecipient = (addressToRemove: string) => {
    const indexToRemove = currentProceedRecipientsIds.indexOf(addressToRemove);
    if (indexToRemove !== -1) {
      const newProceedRecipientsIds = currentProceedRecipientsIds.filter((_, index) => index !== indexToRemove);
      const newProceedRecipientsData = currentProceedRecipientsData.filter((_, index) => index !== indexToRemove);

      setValue("proceedRecipientsIds", newProceedRecipientsIds);
      setValue("proceedRecipientsData", newProceedRecipientsData);
    }
  };

  const columnsHelper = createColumnHelper<IProceedRecipient>();

  const columns = [
    columnsHelper.accessor("address", {
      header: t("stepProceedRecipients.address"),
      enableSorting: false,
    }),
    columnsHelper.accessor("data", {
      header: t("stepProceedRecipients.data"),
      enableSorting: false,
    }),
    columnsHelper.display({
      id: "actions",
      header: t("stepProceedRecipients.actions"),
      enableSorting: false,
      cell(props) {
        const {
          row: {
            original: { address },
          },
        } = props;

        return (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveProceedRecipient(address);
            }}
            variant="table"
            size="xs"
          >
            <PhosphorIcon as={Trash} sx={{ color: "secondary.500" }} />
          </Button>
        );
      },
    }),
  ];

  return (
    <FormStepContainer>
      <Stack gap={2}>
        <Text textStyle="HeadingMediumLG">{t("stepProceedRecipients.title")}</Text>
        <Text textStyle="BodyTextRegularMD">{t("stepProceedRecipients.subtitle")}</Text>
        <Text textStyle="ElementsRegularSM" mt={6}>
          {t("stepProceedRecipients.mandatoryFields")}
        </Text>
      </Stack>
      <Stack w="full">
        <Text textStyle="BodyTextRegularSM">{t("stepProceedRecipients.address")}</Text>
        <InputController
          control={localControl}
          id="address"
          name="address"
          placeholder={t("stepProceedRecipients.addressPlaceholder")}
          rules={{
            required,
            validate: (value: string) => !value || isValidHederaId(value) || t("stepProceedRecipients.invalidHederaId"),
          }}
        />
      </Stack>
      <Stack w="full">
        <Text textStyle="BodyTextRegularSM">{t("stepProceedRecipients.data")}</Text>
        <InputController control={localControl} id="data" name="data" />
      </Stack>
      <Stack w="full" align="end" justifyContent={"flex-end"}>
        <Button onClick={handleAddProceedRecipient} size="md" isDisabled={!localFormState.isValid}>
          {t("stepProceedRecipients.addProceedRecipient")}
        </Button>
      </Stack>
      <Table
        w="full"
        name="proceedRecipients-list"
        columns={columns}
        data={proceedRecipients ?? []}
        emptyComponent={
          <Flex>
            <Text textStyle="BodyRegularMD">The list is empty</Text>
          </Flex>
        }
      />
      <HStack gap={4} w="full" h="100px" align="end" justifyContent={"flex-end"}>
        <CancelButton />
        <PreviousStepButton />
        <NextStepButton isDisabled={!stepFormState.isValid} />
      </HStack>
    </FormStepContainer>
  );
};
