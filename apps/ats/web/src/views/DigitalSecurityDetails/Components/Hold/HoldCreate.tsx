// SPDX-License-Identifier: Apache-2.0

import { Center, HStack, Stack, useDisclosure, VStack } from "@chakra-ui/react";
import {
  Button,
  CalendarInputController,
  Heading,
  InputController,
  InputNumberController,
  PhosphorIcon,
  PopUp,
  Text,
} from "io-bricks-ui";
import { isValidHederaId, min, required } from "../../../../utils/rules";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { WarningCircle } from "@phosphor-icons/react";
import { DATE_TIME_FORMAT, DEFAULT_PARTITION } from "../../../../utils/constants";
import { useWalletStore } from "../../../../store/walletStore";
import { useState } from "react";
import { useCreateHoldByPartition, useForceCreateHoldFromByPartition } from "../../../../hooks/mutations/useHold";
import { CreateHoldByPartitionRequest, CreateHoldFromByPartitionRequest } from "@hashgraph/asset-tokenization-sdk";
import { dateToUnixTimestamp } from "../../../../utils/format";
import { useRolesStore } from "../../../../store/rolesStore";
import { SecurityRole } from "../../../../utils/SecurityRole";

interface FormValues {
  originalAccount: string;
  destinationAccount?: string;
  escrowAccount: string;
  expirationDate: string;
  amount: string;
}

export const HoldCreate = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { id: securityId = "" } = useParams();
  const { address } = useWalletStore();
  const { roles } = useRolesStore();

  const { mutate: createHoldByPartitionMutate, isLoading: isLoadingHoldByPartitionMutate } = useCreateHoldByPartition();

  const { mutate: forceCreateHoldFromByPartitionMutate, isLoading: isLoadingForceHoldFromByPartitionMutate } =
    useForceCreateHoldFromByPartition();

  const { t: tCreate } = useTranslation("security", {
    keyPrefix: "details.hold.create",
  });
  const { t: tActions } = useTranslation("security", {
    keyPrefix: "details.hold.actions.confirmHoldPopUp",
  });
  const { t: tGlobal } = useTranslation("globals");

  const [forceHold, setForceHold] = useState(false);

  const { control, formState, getValues, reset } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      originalAccount: address,
      destinationAccount: "",
      escrowAccount: "",
      expirationDate: "",
      amount: "",
    },
  });

  const onSubmit = () => {
    const { amount, destinationAccount, escrowAccount, expirationDate, originalAccount } = getValues();

    const baseRequest = {
      amount: amount.toString(),
      escrowId: escrowAccount.toString(),
      expirationDate: dateToUnixTimestamp(expirationDate),
      partitionId: DEFAULT_PARTITION,
      securityId,
      targetId: destinationAccount ?? "0.0.0",
    };

    if (forceHold) {
      const request = new CreateHoldFromByPartitionRequest({
        ...baseRequest,
        sourceId: originalAccount.toString(),
      });

      forceCreateHoldFromByPartitionMutate(request, {
        onSuccess: () => {
          reset();
        },
      });

      return;
    }

    const request = new CreateHoldByPartitionRequest({
      ...baseRequest,
    });

    createHoldByPartitionMutate(request, {
      onSuccess: () => {
        reset();
      },
    });

    return;
  };

  const showLoading = isLoadingHoldByPartitionMutate || isLoadingForceHoldFromByPartitionMutate;

  return (
    <Stack w="full" h="full" layerStyle="container">
      <PopUp
        id="confirm-hold-creation-popup"
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
          {roles.includes(SecurityRole._CONTROLLER_ROLE) && (
            <HStack w={"full"} justifyContent={"flex-end"}>
              <Button
                data-testid="force-hold-button"
                variant="secondary"
                onClick={() => {
                  setForceHold(true);
                }}
              >
                Force hold
              </Button>
            </HStack>
          )}
          <VStack align="flex-start" gap={0}>
            <Heading textStyle="HeadingMediumLG">{tCreate("title")}</Heading>
            <Text textStyle="BodyRegularMD">{tCreate("description")}</Text>
          </VStack>
          <VStack
            as="form"
            onSubmit={() => {
              onOpen();
            }}
            w="500px"
            gap={2}
            py={6}
            data-testid="create-hold-form"
          >
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">{tCreate("originalAccount.label")}*</Text>
              </HStack>
              <InputController
                control={control}
                id="originalAccount"
                isDisabled={!forceHold}
                rules={{
                  required,
                  validate: { isValidHederaId: isValidHederaId },
                }}
                placeholder={tCreate("originalAccount.label")}
              />
            </Stack>
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">{tCreate("destinationAccount.label")}</Text>
              </HStack>
              <InputController
                control={control}
                id="destinationAccount"
                placeholder={tCreate("destinationAccount.label")}
                rules={{
                  validate: (value: string) => {
                    if (!value || value === undefined) return true;

                    return isValidHederaId(value);
                  },
                }}
              />
            </Stack>
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">{tCreate("escrowAccount.label")}*</Text>
              </HStack>
              <InputController
                control={control}
                id="escrowAccount"
                rules={{
                  required,
                  validate: { isValidHederaId: isValidHederaId },
                }}
                placeholder={tCreate("escrowAccount.label")}
              />
            </Stack>
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">{tCreate("expirationDate.label")}*</Text>
              </HStack>
              <CalendarInputController
                control={control}
                id="expirationDate"
                rules={{ required }}
                fromDate={new Date()}
                placeholder={tCreate("expirationDate.placeholder")}
                withTimeInput
                format={DATE_TIME_FORMAT}
              />
            </Stack>
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">{tCreate("amount.label")}*</Text>
              </HStack>
              <InputNumberController
                control={control}
                id="amount"
                rules={{ required, min: min(0) }}
                placeholder={tCreate("amount.placeholder")}
              />
            </Stack>

            <Button
              data-testid="create-hold-button"
              alignSelf="flex-end"
              isLoading={showLoading}
              isDisabled={!formState.isValid}
              onClick={() => {
                onOpen();
              }}
            >
              {showLoading ? tGlobal("sending") : tGlobal("send")}
            </Button>
          </VStack>
        </VStack>
      </Center>
    </Stack>
  );
};
