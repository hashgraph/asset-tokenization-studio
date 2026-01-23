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
import {
  useIsAuthorizedBlackListMock,
  useIsAuthorizedWhiteListMock,
} from "../../../hooks/mutations/useExternalControl";
import { IsAuthorizedBlackListMockRequest, IsAuthorizedWhiteListMockRequest } from "@hashgraph/asset-tokenization-sdk";

interface FormValues {
  accountId: string;
}

interface CheckAddressModalProps extends Omit<ModalProps, "children"> {
  externalControlSelected?: ExternalControl;
}

export const CheckAddressModal = ({ externalControlSelected, isOpen, onClose }: CheckAddressModalProps) => {
  const { t: tRemoveAddress } = useTranslation("externalControl", {
    keyPrefix: "checkAddress",
  });

  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: "onChange",
  });

  const { mutateAsync: isAuthorizedBlackListMockMutate, isLoading: isLoadingIsAuthorizedBlackListMockMutate } =
    useIsAuthorizedBlackListMock();
  const { mutateAsync: isAuthorizedWhiteListMockMutate, isLoading: isLoadingIsAuthorizedWhiteListMockMutate } =
    useIsAuthorizedWhiteListMock();

  const onSubmit = (values: FormValues) => {
    if (externalControlSelected?.type === "blacklist") {
      isAuthorizedBlackListMockMutate(
        new IsAuthorizedBlackListMockRequest({
          contractId: externalControlSelected.address,
          targetId: values.accountId,
        }),
      );
      return;
    }

    if (externalControlSelected?.type === "whitelist") {
      isAuthorizedWhiteListMockMutate(
        new IsAuthorizedWhiteListMockRequest({
          contractId: externalControlSelected.address,
          targetId: values.accountId,
        }),
      );
      return;
    }
  };

  const isLoading = isLoadingIsAuthorizedBlackListMockMutate || isLoadingIsAuthorizedWhiteListMockMutate;

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
            {tRemoveAddress("check")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
