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
import { ExternalControl } from "../ExternalControlList";
import { useRemoveFromBlackListMock, useRemoveFromWhiteListMock } from "../../../hooks/mutations/useExternalControl";
import { RemoveFromBlackListMockRequest, RemoveFromWhiteListMockRequest } from "@hashgraph/asset-tokenization-sdk";

interface FormValues {
  accountId: string;
}

interface RemoveAddressModalProps extends Omit<ModalProps, "children"> {
  externalControlSelected?: ExternalControl;
}

export const RemoveAddressModal = ({ externalControlSelected, isOpen, onClose }: RemoveAddressModalProps) => {
  const { t: tRemoveAddress } = useTranslation("externalControl", {
    keyPrefix: "removeAddress",
  });

  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: "onChange",
  });

  const { mutateAsync: removeFromBlackListMockMutate, isLoading: isLoadingRemoveFromBlackListMockMutate } =
    useRemoveFromBlackListMock();
  const { mutateAsync: removeFromWhiteListMockMutate, isLoading: isLoadingRemoveFromWhiteListMockMutate } =
    useRemoveFromWhiteListMock();

  const onSubmit = (values: FormValues) => {
    if (externalControlSelected?.type === "blacklist") {
      return removeFromBlackListMockMutate(
        new RemoveFromBlackListMockRequest({
          contractId: externalControlSelected.address,
          targetId: values.accountId,
        }),
      ).finally(onClose);
    }

    if (externalControlSelected?.type === "whitelist") {
      return removeFromWhiteListMockMutate(
        new RemoveFromWhiteListMockRequest({
          contractId: externalControlSelected.address,
          targetId: values.accountId,
        }),
      ).finally(onClose);
    }
  };

  const isLoading = isLoadingRemoveFromBlackListMockMutate || isLoadingRemoveFromWhiteListMockMutate;

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
