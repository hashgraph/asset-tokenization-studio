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
import { AddToBlackListMockRequest } from "@hashgraph/asset-tokenization-sdk";
import { useGrantKycMock } from "../../../hooks/mutations/useExternalKYC";

interface FormValues {
  accountId: string;
}

interface AddAddressModalProps extends Omit<ModalProps, "children"> {
  externalKYCSelected?: ExternalKYC;
}

export const AddAddressModal = ({
  externalKYCSelected,
  isOpen,
  onClose,
}: AddAddressModalProps) => {
  const { t: tAddAddress } = useTranslation("externalKYC", {
    keyPrefix: "addAddress",
  });

  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: "onChange",
  });

  const {
    mutateAsync: addToKYCListMutate,
    isLoading: isLoadingAddToKYCListMockMutate,
  } = useGrantKycMock();

  const onSubmit = (values: FormValues) => {
    addToKYCListMutate(
      new AddToBlackListMockRequest({
        contractId: externalKYCSelected?.address ?? "",
        targetId: values.accountId,
      }),
    ).finally(onClose);
  };

  const isLoading = isLoadingAddToKYCListMockMutate;

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
        <ModalHeader>{tAddAddress("title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4}>
            <InputController
              control={control}
              id="accountId"
              label={tAddAddress("input.label")}
              placeholder={tAddAddress("input.placeholder")}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            isLoading={isLoading}
            isDisabled={isLoading}
            type="submit"
            onClick={handleSubmit(onSubmit)}
          >
            {tAddAddress("add")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
