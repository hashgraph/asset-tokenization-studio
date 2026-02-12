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
import { useIsAuthorizedKYCListMock } from "../../../hooks/mutations/useExternalKYC";
import { GetKycStatusMockRequest } from "@hashgraph/asset-tokenization-sdk";

interface FormValues {
  accountId: string;
}

interface CheckAddressModalProps extends Omit<ModalProps, "children"> {
  externalKYCSelected?: ExternalKYC;
}

export const CheckAddressModal = ({ externalKYCSelected, isOpen, onClose }: CheckAddressModalProps) => {
  const { t: tRemoveAddress } = useTranslation("externalKYC", {
    keyPrefix: "checkAddress",
  });

  const { control, handleSubmit, reset, watch } = useForm<FormValues>({
    mode: "onChange",
  });

  const { mutateAsync: isAuthorizedKYCListMockMutate, isLoading: isLoadingIsAuthorizedKYCListMockMutate } =
    useIsAuthorizedKYCListMock();

  const onSubmit = (values: FormValues) => {
    if (externalKYCSelected) {
      isAuthorizedKYCListMockMutate(
        new GetKycStatusMockRequest({
          contractId: externalKYCSelected.address,
          targetId: values.accountId,
        }),
      );
    }
  };

  const isLoading = isLoadingIsAuthorizedKYCListMockMutate;

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
          <Button
            isLoading={isLoading}
            isDisabled={isLoading || !watch("accountId")}
            type="submit"
            onClick={handleSubmit(onSubmit)}
          >
            {tRemoveAddress("check")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
