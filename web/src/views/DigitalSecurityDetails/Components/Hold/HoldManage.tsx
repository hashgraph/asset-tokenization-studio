import {
  Box,
  Center,
  Flex,
  HStack,
  Stack,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  Button,
  Heading,
  InputController,
  InputNumberController,
  PhosphorIcon,
  PopUp,
  Text,
} from "io-bricks-ui";
import { isHederaValidAddress, min, required } from "../../../../utils/rules";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { WarningCircle } from "@phosphor-icons/react";
import { useState } from "react";
import {
  useExecuteHoldByPartition,
  useReleaseHoldByPartition,
} from "../../../../hooks/mutations/useHold";
import {
  ExecuteHoldByPartitionRequest,
  ReleaseHoldByPartitionRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { DEFAULT_PARTITION } from "../../../../utils/constants";
import { useWalletStore } from "../../../../store/walletStore";

enum TypeMode {
  execute = "execute",
  release = "release",
}

interface FormValues {
  holdId: string;
  amount: string;
  destinationAccount?: string | null;
}

export const HoldManage = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { id: securityId = "" } = useParams();

  const [isMutating, setIsMutating] = useState(false);
  const [manageMode, setManageMode] = useState<keyof typeof TypeMode>(
    TypeMode.execute,
  );

  const { address } = useWalletStore();

  const { t: tType } = useTranslation("security", {
    keyPrefix:
      manageMode === TypeMode.execute
        ? "details.hold.execute"
        : "details.hold.release",
  });
  const { t: tManage } = useTranslation("security", {
    keyPrefix: "details.hold.manage",
  });
  const { t: tForm } = useTranslation("security", {
    keyPrefix: "details.hold.form",
  });
  const { t: tActions } = useTranslation("security", {
    keyPrefix: "details.hold.actions.confirmManage",
  });
  const { t: tGlobal } = useTranslation("globals");

  const { control, formState, getValues, reset } = useForm<FormValues>({
    mode: "onChange",
  });

  const { mutate: releaseHoldByPartitionMutate } = useReleaseHoldByPartition();
  const { mutate: executeHoldByPartitionMutate } = useExecuteHoldByPartition();

  const onSubmit = () => {
    setIsMutating(true);

    const { amount, destinationAccount, holdId } = getValues();

    const defaultRequest = {
      amount: String(amount),
      partitionId: DEFAULT_PARTITION,
      holdId: Number(holdId),
      securityId,
      targetId: address,
    };

    if (manageMode === "execute") {
      const request = new ExecuteHoldByPartitionRequest({
        ...defaultRequest,
        sourceId: destinationAccount!,
      });
      executeHoldByPartitionMutate(request, {
        onSettled() {
          setIsMutating(false);
        },
        onSuccess() {
          reset();
        },
      });
      return;
    }

    if (manageMode === "release") {
      const request = new ReleaseHoldByPartitionRequest({
        ...defaultRequest,
      });
      releaseHoldByPartitionMutate(request, {
        onSettled() {
          setIsMutating(false);
        },
        onSuccess() {
          reset();
        },
      });
      return;
    }
  };

  return (
    <Stack w="full" h="full" layerStyle="container">
      <PopUp
        id="confirm-hold-manage-popup"
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
      <HStack justifyContent={"center"}>
        <Flex
          borderWidth={1}
          borderColor={"primary.100"}
          alignItems={"center"}
          borderRadius={10}
          p={1}
        >
          {Object.values(TypeMode).map((mode) => (
            <Box
              key={mode}
              paddingX={16}
              paddingY={2}
              onClick={() => setManageMode(mode)}
              borderRadius={8}
              position="relative"
              zIndex={1}
              {...(manageMode === mode && {
                bgColor: "primary.200",
              })}
              _hover={{ cursor: "pointer" }}
            >
              <Text
                textStyle={"BodyMediumMD"}
                {...(manageMode === mode && {
                  color: "white",
                })}
              >
                {tManage(mode)}
              </Text>
            </Box>
          ))}
        </Flex>
      </HStack>
      <Center w="full" h="full" bg="neutral.dark.600">
        <VStack align="flex-start" p={6} gap={4}>
          <VStack align="flex-start" gap={0}>
            <Heading textStyle="HeadingMediumLG">{tType("title")}</Heading>
            <Text textStyle="BodyRegularMD">{tType("description")}</Text>
          </VStack>
          <VStack
            as="form"
            onSubmit={() => {
              onOpen();
            }}
            w="500px"
            gap={6}
            py={6}
            data-testid="manage-hold-form"
          >
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">
                  {tForm("holdId.label")}*
                </Text>
              </HStack>
              <InputController
                control={control}
                id="holdId"
                rules={{
                  required,
                }}
                placeholder={tForm("holdId.label")}
              />
            </Stack>
            {manageMode === TypeMode.execute && (
              <Stack w="full">
                <HStack justifySelf="flex-start">
                  <Text textStyle="BodyTextRegularSM">
                    {tForm("destinationAccount.label")}
                  </Text>
                </HStack>
                <InputController
                  control={control}
                  id="destinationAccount"
                  placeholder={tForm("destinationAccount.label")}
                  isRequired={true}
                  rules={{
                    required,
                    validate: { isHederaValidAddress },
                  }}
                />
              </Stack>
            )}
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">
                  {tForm("amount.label")}*
                </Text>
              </HStack>
              <InputNumberController
                control={control}
                id="amount"
                rules={{ required, min: min(0) }}
                placeholder={tForm("amount.placeholder")}
              />
            </Stack>

            <Button
              data-testid="manage-hold-button"
              alignSelf="flex-end"
              isLoading={isMutating}
              isDisabled={!formState.isValid || isMutating}
              onClick={() => {
                onOpen();
              }}
            >
              {tGlobal("send")}
            </Button>
          </VStack>
        </VStack>
      </Center>
    </Stack>
  );
};
