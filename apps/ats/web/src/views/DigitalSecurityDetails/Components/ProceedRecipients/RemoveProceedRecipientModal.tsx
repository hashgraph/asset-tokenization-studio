// SPDX-License-Identifier: Apache-2.0

import {
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  VStack,
} from "@chakra-ui/react";
import { Button, InputController } from "io-bricks-ui";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { isValidHederaId, required } from "../../../../utils/rules";
import { useAddProceedRecipient } from "../../../../hooks/mutations/useProceedRecipients";
import { AddProceedRecipientRequest } from "@hashgraph/asset-tokenization-sdk";

interface FormValues {
  address: string;
  data?: string;
}

interface AddProceedRecipientModalProps extends Omit<ModalProps, "children"> {}

export const AddProceedRecipientModal = ({ isOpen, onClose }: AddProceedRecipientModalProps) => {
  const { id: securityId = "" } = useParams();

  const { t: tCreate } = useTranslation("security", {
    keyPrefix: "details.proceedRecipients.create",
  });

  const {
    control,
    formState: { isValid },
    handleSubmit,
    reset,
  } = useForm<FormValues>({
    mode: "onChange",
  });

  const { mutate: addProceedRecipientMutation, isPending: isPendingAddProceedRecipient } = useAddProceedRecipient();

  const onSubmit = (values: FormValues) => {
    const request = new AddProceedRecipientRequest({
      securityId,
      proceedRecipientId: values.address,
      data: values.data ?? "",
    });

    console.log("request", request);

    addProceedRecipientMutation(request, {
      onSettled() {
        onClose();
      },
      onSuccess() {
        reset();
      },
    });
  };

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
    >
      <ModalOverlay />
      <ModalContent bgColor={"white"}>
        <ModalHeader>{tCreate("title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4}>
            <InputController
              control={control}
              id="address"
              label={tCreate("form.address.label")}
              placeholder={tCreate("form.address.placeholder")}
              isRequired={true}
              rules={{
                required,
                validate: { isValidHederaId: isValidHederaId },
              }}
            />
            <InputController
              control={control}
              id="data"
              label={tCreate("form.data.label")}
              placeholder={tCreate("form.data.placeholder")}
              isRequired={false}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack gap={2}>
            <Button type="submit" onClick={handleSubmit(onSubmit)} variant={"secondary"}>
              {tCreate("buttons.cancel")}
            </Button>
            <Button
              isDisabled={!isValid || isPendingAddProceedRecipient}
              isLoading={isPendingAddProceedRecipient}
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              {tCreate("buttons.add")}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
