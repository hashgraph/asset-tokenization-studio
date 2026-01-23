import { Center, HStack, Stack, useDisclosure, VStack } from "@chakra-ui/react";
import {
  Button,
  CalendarInputController,
  Heading,
  InputController,
  InputNumberController,
  PhosphorIcon,
  PopUp,
  SelectController,
  Text,
} from "io-bricks-ui";
import { isValidHederaId, min, required } from "../../../../utils/rules";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { WarningCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { DATE_TIME_FORMAT, DEFAULT_PARTITION } from "../../../../utils/constants";
import {
  useCreateClearingHoldByPartition,
  useCreateClearingRedeemByPartition,
  useCreateClearingTransferByPartition,
} from "../../../../hooks/mutations/useClearingOperations";
import {
  ClearingCreateHoldByPartitionRequest,
  ClearingRedeemByPartitionRequest,
  ClearingTransferByPartitionRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { dateToUnixTimestamp } from "../../../../utils/format";

enum ClearingOperationType {
  TRANSFER = "Transfer",
  REDEEM = "Redeem",
  HOLD = "Hold",
}

interface FormValues {
  operationType: keyof typeof ClearingOperationType;
  amount: string;
  expirationDate: string;
  targetId: string;
  holdExpirationDate: string;
  sourceId: string;
  escrowAccount: string;
}

export const ClearingOperationsCreate = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const { id: securityId = "" } = useParams();

  const [isMutating, setIsMutating] = useState(false);

  const { t: tCreate } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.create",
  });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.create.form",
  });
  const { t: tActions } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.actions.confirmCreate",
  });
  const { t: tGlobal } = useTranslation("globals");

  const { control, formState, getValues, watch, reset } = useForm<FormValues>({
    mode: "onChange",
  });

  const { mutate: createClearingTransferByPartition } = useCreateClearingTransferByPartition();
  const { mutate: createClearingRedeemByPartition } = useCreateClearingRedeemByPartition();
  const { mutate: createClearingHoldByPartition } = useCreateClearingHoldByPartition();

  const onSubmit = () => {
    setIsMutating(true);

    const { operationType, amount, expirationDate, escrowAccount, holdExpirationDate, targetId } = getValues();

    if (operationType === ClearingOperationType.TRANSFER.valueOf()) {
      const transferRequest = new ClearingTransferByPartitionRequest({
        securityId,
        amount: amount.toString(),
        expirationDate: dateToUnixTimestamp(expirationDate),
        targetId,
        partitionId: DEFAULT_PARTITION,
      });

      createClearingTransferByPartition(transferRequest, {
        onSettled() {
          setIsMutating(false);
        },
        onSuccess() {
          reset();
        },
      });
    }

    if (operationType === ClearingOperationType.REDEEM.valueOf()) {
      const redeemRequest = new ClearingRedeemByPartitionRequest({
        securityId,
        amount: amount.toString(),
        expirationDate: dateToUnixTimestamp(expirationDate),
        partitionId: DEFAULT_PARTITION,
      });

      createClearingRedeemByPartition(redeemRequest, {
        onSettled() {
          setIsMutating(false);
        },
        onSuccess() {
          reset();
        },
      });
    }

    if (operationType === ClearingOperationType.HOLD.valueOf()) {
      const holdRequest = new ClearingCreateHoldByPartitionRequest({
        securityId,
        amount: amount.toString(),
        clearingExpirationDate: dateToUnixTimestamp(expirationDate),
        holdExpirationDate: dateToUnixTimestamp(holdExpirationDate),
        escrowId: escrowAccount,
        // TODO: check with SDK: sourceId,
        targetId,
        partitionId: DEFAULT_PARTITION,
      });

      createClearingHoldByPartition(holdRequest, {
        onSettled() {
          setIsMutating(false);
        },
        onSuccess() {
          reset();
        },
      });
    }
  };

  return (
    <Stack w="full" h="full" layerStyle="container">
      <PopUp
        id="confirm-clearing-operation-create-popup"
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
            <Heading textStyle="HeadingMediumLG">{tCreate("title")}</Heading>
          </VStack>
          <VStack
            as="form"
            onSubmit={() => {
              onOpen();
            }}
            w="500px"
            gap={6}
            py={6}
            data-testid="create-clearing-operation-form"
          >
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">{tForm("operationType.label")}*</Text>
              </HStack>
              <SelectController
                id="operationType"
                control={control}
                rules={{ required }}
                options={[
                  {
                    value: ClearingOperationType.TRANSFER,
                    label: ClearingOperationType.TRANSFER,
                  },
                  {
                    value: ClearingOperationType.REDEEM,
                    label: ClearingOperationType.REDEEM,
                  },
                  {
                    value: ClearingOperationType.HOLD,
                    label: ClearingOperationType.HOLD,
                  },
                ]}
              />
            </Stack>
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">{tForm("amount.label")}*</Text>
              </HStack>
              <InputNumberController
                control={control}
                id="amount"
                rules={{ required, min: min(0) }}
                placeholder={tForm("amount.placeholder")}
              />
            </Stack>
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">{tForm("expirationDate.label")}*</Text>
              </HStack>
              <CalendarInputController
                control={control}
                id="expirationDate"
                rules={{ required }}
                fromDate={new Date()}
                placeholder={tForm("expirationDate.placeholder")}
                withTimeInput
                format={DATE_TIME_FORMAT}
              />
            </Stack>

            {watch("operationType") === ClearingOperationType.TRANSFER.valueOf() && (
              <Stack w="full">
                <HStack justifySelf="flex-start">
                  <Text textStyle="BodyTextRegularSM">{tForm("targetId.label")}*</Text>
                </HStack>
                <InputController
                  control={control}
                  id="targetId"
                  placeholder={tForm("targetId.placeholder")}
                  isRequired={true}
                  rules={{
                    required,
                    validate: { isValidHederaId: isValidHederaId },
                  }}
                />
              </Stack>
            )}

            {watch("operationType") === ClearingOperationType.HOLD.valueOf() && (
              <VStack gap={6} w="full">
                <Stack w="full">
                  <HStack justifySelf="flex-start">
                    <Text textStyle="BodyTextRegularSM">{tForm("holdExpirationDate.label")}*</Text>
                  </HStack>
                  <CalendarInputController
                    control={control}
                    id="holdExpirationDate"
                    rules={{ required }}
                    fromDate={new Date()}
                    placeholder={tForm("holdExpirationDate.placeholder")}
                    withTimeInput
                    format={DATE_TIME_FORMAT}
                  />
                </Stack>
                <Stack w="full">
                  <HStack justifySelf="flex-start">
                    <Text textStyle="BodyTextRegularSM">{tForm("escrowAccount.label")}*</Text>
                  </HStack>
                  <InputController
                    control={control}
                    id="escrowAccount"
                    placeholder={tForm("escrowAccount.placeholder")}
                    isRequired={true}
                    rules={{
                      required,
                      validate: { isValidHederaId: isValidHederaId },
                    }}
                  />
                </Stack>
                <Stack w="full">
                  <HStack justifySelf="flex-start">
                    <Text textStyle="BodyTextRegularSM">{tForm("sourceId.label")}*</Text>
                  </HStack>
                  <InputController
                    control={control}
                    id="sourceId"
                    placeholder={tForm("sourceId.placeholder")}
                    isRequired={true}
                    rules={{
                      required,
                      validate: { isValidHederaId: isValidHederaId },
                    }}
                  />
                </Stack>
                <Stack w="full">
                  <HStack justifySelf="flex-start">
                    <Text textStyle="BodyTextRegularSM">{tForm("targetId.label")}*</Text>
                  </HStack>
                  <InputController
                    control={control}
                    id="targetId"
                    placeholder={tForm("targetId.placeholder")}
                    isRequired={true}
                    rules={{
                      required,
                      validate: { isValidHederaId: isValidHederaId },
                    }}
                  />
                </Stack>
              </VStack>
            )}

            <Button
              data-testid="create-clean-operations-button"
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
