import { Center, HStack, Stack, useDisclosure, VStack } from "@chakra-ui/react";
import {
  Button,
  Heading,
  InputController,
  PhosphorIcon,
  PopUp,
  SelectController,
  Text,
} from "io-bricks-ui";
import { isHederaValidAddress, required } from "../../../../utils/rules";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { WarningCircle } from "@phosphor-icons/react";
import { useState } from "react";

enum ClearingOperationType {
  APPROVE = "Approve",
  CANCEL = "Cancel",
}

interface FormValues {
  clearingOperationId: string;
  sourceId: string;
  operationType: keyof ClearingOperationType;
}

export const ClearingOperationsManage = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const { id: securityId = "" } = useParams();

  const [isMutating, setIsMutating] = useState(false);

  const { t: tManage } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.manage",
  });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.manage.form",
  });
  const { t: tActions } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.actions.confirmManage",
  });
  const { t: tGlobal } = useTranslation("globals");

  const { control, formState, getValues } = useForm<FormValues>({
    mode: "onChange",
  });

  const onSubmit = () => {
    setIsMutating(true);

    const { clearingOperationId, sourceId } = getValues();

    // @ts-ignore TODO: waiting SDK integration
    const _defaultRequest = { securityId, clearingOperationId, sourceId };

    setIsMutating(false);
  };

  return (
    <Stack w="full" h="full" layerStyle="container">
      <PopUp
        id="confirm-clearing-operation-manage-popup"
        isOpen={isOpen}
        onClose={onClose}
        icon={<PhosphorIcon as={WarningCircle} size="md" />}
        title={tActions("title")}
        description={tActions("description")}
        confirmText={tActions("confirmText")}
        cancelText={tActions("cancelText")}
        onConfirm={() => {
          onSubmit();
          onClose();
        }}
        onCancel={() => {
          onClose();
        }}
      />
      <Center w="full" h="full" bg="neutral.dark.600">
        <VStack align="flex-start" p={6} gap={4}>
          <VStack align="flex-start" gap={0}>
            <Heading textStyle="HeadingMediumLG">{tManage("title")}</Heading>
          </VStack>
          <VStack
            as="form"
            onSubmit={() => {
              onOpen();
            }}
            w="500px"
            gap={6}
            py={6}
            data-testid="manage-clearing-operation-form"
          >
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">
                  {tForm("operationType.label")}*
                </Text>
              </HStack>
              <SelectController
                id="operationType"
                control={control}
                rules={{ required }}
                options={[
                  { value: "Approve", label: ClearingOperationType.APPROVE },
                  { value: "Cancel", label: ClearingOperationType.CANCEL },
                ]}
              />
            </Stack>
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">
                  {tForm("clearingOperationId.label")}*
                </Text>
              </HStack>
              <InputController
                control={control}
                id="clearingOperationId"
                placeholder={tForm("clearingOperationId.placeholder")}
                isRequired={true}
                rules={{
                  required,
                  validate: { isHederaValidAddress },
                }}
              />
            </Stack>
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">
                  {tForm("sourceId.label")}
                </Text>
              </HStack>
              <InputController
                control={control}
                id="sourceId"
                placeholder={tForm("sourceId.placeholder")}
                isRequired={true}
                rules={{
                  required,
                  validate: { isHederaValidAddress },
                }}
              />
            </Stack>

            <Button
              data-testid="manage-clean-operations-button"
              alignSelf="flex-end"
              isLoading={isMutating}
              isDisabled={!formState.isValid || isMutating}
              onClick={() => {
                onOpen();
              }}
            >
              {tGlobal("execute")}
            </Button>
          </VStack>
        </VStack>
      </Center>
    </Stack>
  );
};
