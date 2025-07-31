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
import { isHederaValidId, required } from "../../../../utils/rules";
import { useAddIssuer } from "../../../../hooks/mutations/useSSIManager";
import { AddIssuerRequest } from "@hashgraph/asset-tokenization-sdk";
import { useParams } from "react-router-dom";
import { useState } from "react";

interface FormValues {
  accountId: string;
}

interface SSIManagerModalProps extends Omit<ModalProps, "children"> {}

export const SSIManagerModal = ({ isOpen, onClose }: SSIManagerModalProps) => {
  const { id: securityId = "" } = useParams();

  const { t: tCreate } = useTranslation("security", {
    keyPrefix: "details.ssiManager.create",
  });

  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<FormValues>({
    mode: "onChange",
  });

  const { mutate } = useAddIssuer();

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    const request = new AddIssuerRequest({
      securityId,
      issuerId: values.accountId,
    });

    mutate(request, {
      onSettled() {
        setIsLoading(false);
      },
      onSuccess() {
        onClose();
      },
    });
  };

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bgColor={"white"}>
        <ModalHeader>{tCreate("title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4}>
            <InputController
              control={control}
              id="accountId"
              label={tCreate("form.account.label")}
              placeholder={tCreate("form.account.placeholder")}
              rules={{ required, validate: { isHederaValidId: isHederaValidId } }}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            type="submit"
            isDisabled={!isValid || isLoading}
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
