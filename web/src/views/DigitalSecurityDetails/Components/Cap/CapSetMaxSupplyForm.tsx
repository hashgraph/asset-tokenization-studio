import { Center, HStack, Stack, useDisclosure, VStack } from "@chakra-ui/react";
import {
  Button,
  Heading,
  InputController,
  InputNumberController,
  PhosphorIcon,
  PopUp,
  Text,
} from "io-bricks-ui";
import { isHederaValidId, min, required } from "../../../../utils/rules";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useSetCapMaxSupply } from "../../../../hooks/mutations/useSetCapMaxSupply";
import { SetMaxSupplyRequest } from "@hashgraph/asset-tokenization-sdk";
import { WarningCircle } from "@phosphor-icons/react";

export const CapSetMaxSupplyForm = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { id: securityId = "" } = useParams();

  const { t: tForm } = useTranslation("security", {
    keyPrefix: "details.cap.form",
  });
  const { t: tActions } = useTranslation("security", {
    keyPrefix: "details.cap.actions",
  });
  const { t: tGlobal } = useTranslation("globals");

  const { control, formState, watch, handleSubmit, reset } = useForm<{
    maxSupply: string;
    securityId: string;
  }>({
    mode: "onChange",
  });

  const { mutate: setCapMaxSupplyMutation, isLoading } = useSetCapMaxSupply();

  const onSubmit = () => {
    onOpen();
  };

  const handleSetMaxSupply = () => {
    const maxSupply = watch("maxSupply");

    const setMaxSupplyRequest = new SetMaxSupplyRequest({
      maxSupply: maxSupply.toString(),
      securityId,
    });

    setCapMaxSupplyMutation(setMaxSupplyRequest, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <Stack w="full" h="full" layerStyle="container">
      <PopUp
        id="confirmSetMaxSupplyPopUp"
        isOpen={isOpen}
        onClose={onClose}
        icon={<PhosphorIcon as={WarningCircle} size="md" />}
        title={tActions("confirmPopUp.title")}
        description={tActions("confirmPopUp.description")}
        confirmText={tActions("confirmPopUp.confirmText")}
        onConfirm={() => {
          onClose();
          handleSetMaxSupply();
        }}
        onCancel={() => {
          onClose();
        }}
        cancelText={tActions("confirmPopUp.cancelText")}
        confirmButtonProps={{ status: "danger" }}
      />
      <Center w="full" h="full" bg="neutral.dark.600">
        <VStack align="flex-start" p={6} gap={4}>
          <VStack align="flex-start" gap={0}>
            <Heading textStyle="HeadingMediumLG">{tForm("title")}</Heading>
            <Text textStyle="BodyRegularMD">{tForm("description")}</Text>
          </VStack>
          <VStack
            as="form"
            onSubmit={handleSubmit(onSubmit)}
            w="500px"
            gap={6}
            py={6}
            data-testid="set-max-supply-form"
          >
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">
                  {tForm("securityId.label")}*
                </Text>
              </HStack>
              <InputController
                control={control}
                id="securityId"
                rules={{
                  required,
                  validate: { isHederaValidId: isHederaValidId },
                }}
                placeholder={securityId}
                defaultValue={securityId}
                value={securityId}
                isDisabled
              />
            </Stack>
            <Stack w="full">
              <HStack justifySelf="flex-start">
                <Text textStyle="BodyTextRegularSM">
                  {tForm("maxSupply.label")}*
                </Text>
              </HStack>
              <InputNumberController
                autoFocus
                control={control}
                id="maxSupply"
                rules={{ required, min: min(0) }}
                placeholder={tForm("maxSupply.placeholder")}
              />
            </Stack>

            <Button
              data-testid="set-max-supply-button"
              alignSelf="flex-end"
              isLoading={isLoading}
              isDisabled={!formState.isValid}
              type="submit"
            >
              {isLoading ? tGlobal("sending") : tGlobal("send")}
            </Button>
          </VStack>
        </VStack>
      </Center>
    </Stack>
  );
};
