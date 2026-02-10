// SPDX-License-Identifier: Apache-2.0

import {
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
import { ExternalKYC } from "../ExternalKYCList";
import { RemoveFromBlackListMockRequest } from "@hashgraph/asset-tokenization-sdk";
import { useRevokeKycMock } from "../../../hooks/mutations/useExternalKYC";

interface FormValues {
  accountId: string;
}

interface RemoveAddressModalProps extends Omit<ModalProps, "children"> {
  externalKYCSelected?: ExternalKYC;
}

export const RemoveAddressModal = ({ externalKYCSelected, isOpen, onClose }: RemoveAddressModalProps) => {
  const { t: tRemoveAddress } = useTranslation("externalKYC", {
    keyPrefix: "removeAddress",
  });

  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: "onChange",
  });

  const { mutateAsync: removeFromKYCMockMutate, isLoading: isLoadingRemoveFromKYCMockMutate } = useRevokeKycMock();

  const onSubmit = (values: FormValues) => {
    removeFromKYCMockMutate(
      new RemoveFromBlackListMockRequest({
        contractId: externalKYCSelected?.address ?? "",
        targetId: values.accountId,
      }),
    ).finally(onClose);
  };

  const isLoading = isLoadingRemoveFromKYCMockMutate;

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        onClose();
        reset();
      }}
    >
      <ModalOverlay />
      <ModalContent bgColor={"white"}>
        <ModalHeader>{tRemoveAddress("title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4}>
            <InputController
              control={control}
              id="accountId"
              label={tRemoveAddress("input.label")}
              placeholder={tRemoveAddress("input.placeholder")}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button isLoading={isLoading} isDisabled={isLoading} type="submit" onClick={handleSubmit(onSubmit)}>
            {tRemoveAddress("remove")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
