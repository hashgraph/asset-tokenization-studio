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
import {
  Button,
  PhosphorIcon,
  SelectController,
  Tag,
  Text,
  useToast,
} from "io-bricks-ui";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { useExternalKYCStore } from "../../../../store/externalKYCStore";
import { useUpdateExternalKYCLists } from "../../../../hooks/mutations/useExternalKYC";
import { UpdateExternalKycListsRequest } from "@hashgraph/asset-tokenization-sdk";

type SelectOption = {
  value: string;
  label: string;
};

interface FormValues {
  accountId: string;
  vcFile: string;
}

interface AddExternalKYCModalProps extends Omit<ModalProps, "children"> {}

export const AddExternalKYCModal = ({
  isOpen,
  onClose,
}: AddExternalKYCModalProps) => {
  const toast = useToast();

  const [selectedKYCs, setSelectedKYCs] = useState<SelectOption[]>([]);

  const { id: securityId = "" } = useParams();

  const { t: tCreate } = useTranslation("security", {
    keyPrefix: "details.externalKYC.create",
  });
  const { t: tMessage } = useTranslation("externalKYC", {
    keyPrefix: "add.messages",
  });

  const { externalKYCs } = useExternalKYCStore();

  const {
    mutateAsync: updateExternalKYCLists,
    isLoading: isLoadingUpdateExternalKYCLists,
  } = useUpdateExternalKYCLists();

  const options = externalKYCs.map((external) => ({
    label: external.address,
    value: external.address,
  }));

  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: "onChange",
  });

  const onSubmit = (_values: FormValues) => {
    updateExternalKYCLists(
      new UpdateExternalKycListsRequest({
        securityId,
        externalKycListsAddresses: selectedKYCs.map((option) => option.value),
        actives: selectedKYCs.map(() => true),
      }),
    ).finally(() => {
      onClose();
      toast.show({
        duration: 3000,
        title: tMessage("updateExternalKYC.success"),
        description: tMessage("updateExternalKYC.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    });
  };

  const isDisable = selectedKYCs.length === 0;

  const handleSelectChange = (selectedOption: SelectOption) => {
    setSelectedKYCs((prevSelectedOptions) => {
      if (
        !prevSelectedOptions.some(
          (option) => option.value === selectedOption.value,
        )
      ) {
        return [...prevSelectedOptions, selectedOption];
      }

      return prevSelectedOptions;
    });
  };

  const handleTagRemove = (addressToRemove: SelectOption) => {
    setSelectedKYCs((prevSelectedAddresses) =>
      prevSelectedAddresses.filter(
        (address) => address.value !== addressToRemove.value,
      ),
    );
  };

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        onClose();
        reset();
        setSelectedKYCs([]);
      }}
    >
      <ModalOverlay />
      <ModalContent bgColor={"white"}>
        <ModalHeader>{tCreate("title")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4}>
            <SelectController
              control={control}
              id="accountId"
              label={tCreate("form.selector.label")}
              placeholder={tCreate("form.selector.placeholder")}
              options={options}
              setsFullOption
              onChange={(option) => handleSelectChange(option as SelectOption)}
            />
          </VStack>
          {selectedKYCs.length > 0 && (
            <VStack alignItems={"flex-start"} mt={6}>
              <Text>External KYCs selected:</Text>
              <HStack
                layerStyle="whiteContainer"
                noOfLines={20}
                lineHeight={10}
              >
                {selectedKYCs.map((item) => {
                  return (
                    <Tag
                      key={item.value}
                      label={item.label}
                      size="sm"
                      rightIcon={<PhosphorIcon as={X} />}
                      onClick={() => handleTagRemove(item)}
                    />
                  );
                })}
              </HStack>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={isDisable}
            isLoading={isLoadingUpdateExternalKYCLists}
            type="submit"
            onClick={handleSubmit(onSubmit)}
          >
            {tCreate("form.add")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
