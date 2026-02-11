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
import { Button, Input, InputController } from "io-bricks-ui";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useUpdateProceedRecipient } from "../../../../hooks/mutations/useProceedRecipients";
import { UpdateProceedRecipientDataRequest } from "@hashgraph/asset-tokenization-sdk";
import { textToHex } from "../../../../utils/format";

interface FormValues {
  address: string;
  data?: string;
}

interface UpdateProceedRecipientModalProps extends Omit<ModalProps, "children"> {
  proceedRecipientId: string;
}

export const UpdateProceedRecipientModal = ({
  isOpen,
  onClose,
  proceedRecipientId,
}: UpdateProceedRecipientModalProps) => {
  const { id: securityId = "" } = useParams();

  const { t: tUpdate } = useTranslation("security", {
    keyPrefix: "details.proceedRecipients.update",
  });

  const {
    control,
    formState: { isValid },
    handleSubmit,
    reset,
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      address: proceedRecipientId,
    },
  });

  const { mutate: updateProceedRecipientMutation, isPending: isPendingUpdateProceedRecipient } =
    useUpdateProceedRecipient();

  const onSubmit = (values: FormValues) => {
    const request = new UpdateProceedRecipientDataRequest({
      securityId,
      proceedRecipientId,
      data: values.data ? textToHex(values.data) : "",
    });

    updateProceedRecipientMutation(request, {
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
        <ModalHeader>{tUpdate("title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4}>
            <Input
              label={tUpdate("form.address.label")}
              isRequired={true}
              isDisabled={true}
              value={proceedRecipientId}
            />
            <InputController control={control} id="data" label={tUpdate("form.data.label")} isRequired={false} />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack gap={2}>
            <Button
              type="submit"
              onClick={() => {
                reset();
                onClose();
              }}
              variant={"secondary"}
            >
              {tUpdate("buttons.cancel")}
            </Button>
            <Button
              isDisabled={!isValid || isPendingUpdateProceedRecipient}
              isLoading={isPendingUpdateProceedRecipient}
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              {tUpdate("buttons.update")}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
