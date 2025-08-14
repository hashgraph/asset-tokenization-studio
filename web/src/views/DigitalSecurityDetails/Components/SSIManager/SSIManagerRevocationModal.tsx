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
import { useSetRevocationRegistryAddress } from "../../../../hooks/mutations/useSSIManager";
import { useState } from "react";
import { SetRevocationRegistryAddressRequest } from "@hashgraph/asset-tokenization-sdk";
import { useParams } from "react-router-dom";
import { isValidHederaId, required } from "../../../../utils/rules";

interface FormValues {
  accountId: string;
}

interface SSIManagerRevocationModalProps extends Omit<ModalProps, "children"> {}

export const SSIManagerRevocationModal = ({
  isOpen,
  onClose,
}: SSIManagerRevocationModalProps) => {
  const { id: securityId = "" } = useParams();

  const { t: tRevocation } = useTranslation("security", {
    keyPrefix: "details.ssiManager.revocation",
  });

  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<FormValues>({
    mode: "onChange",
  });

  const { mutate } = useSetRevocationRegistryAddress();

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    const request = new SetRevocationRegistryAddressRequest({
      securityId,
      revocationRegistryId: values.accountId,
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
        <ModalHeader>{tRevocation("title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4}>
            <InputController
              control={control}
              id="accountId"
              label={tRevocation("form.account.label")}
              placeholder={tRevocation("form.account.placeholder")}
              rules={{
                required,
                validate: { isValidHederaId: isValidHederaId },
              }}
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
            {tRevocation("change")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
