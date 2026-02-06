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
import { Button, PhosphorIcon, SelectController, Tag, Text, useToast } from "io-bricks-ui";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { useExternalControlStore } from "../../../../store/externalControlStore";
import { useUpdateExternalControlLists } from "../../../../hooks/mutations/useExternalControl";
import { UpdateExternalControlListsRequest } from "@hashgraph/asset-tokenization-sdk";

type SelectOption = {
  value: string;
  label: string;
};

interface FormValues {
  accountId: string;
  vcFile: string;
}

interface AddExternalControlModalProps extends Omit<ModalProps, "children"> {}

export const AddExternalControlModal = ({ isOpen, onClose }: AddExternalControlModalProps) => {
  const toast = useToast();

  const [selectedControls, setSelectedControls] = useState<SelectOption[]>([]);

  const { id: securityId = "" } = useParams();

  const { t: tCreate } = useTranslation("security", {
    keyPrefix: "details.externalControl.create",
  });
  const { t: tMessage } = useTranslation("externalControl", {
    keyPrefix: "add.messages",
  });

  const { externalControls } = useExternalControlStore();
  const { mutateAsync, isLoading } = useUpdateExternalControlLists();

  const options = externalControls.map((external) => ({
    label: external.address,
    value: external.address,
  }));

  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: "onChange",
  });

  const onSubmit = (_values: FormValues) => {
    mutateAsync(
      new UpdateExternalControlListsRequest({
        securityId,
        externalControlListsAddresses: selectedControls.map((option) => option.value),
        actives: selectedControls.map(() => true),
      }),
    ).finally(() => {
      onClose();
      toast.show({
        duration: 3000,
        title: tMessage("updateExternalControl.success"),
        description: tMessage("updateExternalControl.descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    });
  };

  const isDisable = selectedControls.length === 0;

  const handleSelectChange = (selectedOption: SelectOption) => {
    setSelectedControls((prevSelectedOptions) => {
      if (!prevSelectedOptions.some((option) => option.value === selectedOption.value)) {
        return [...prevSelectedOptions, selectedOption];
      }

      return prevSelectedOptions;
    });
  };

  const handleTagRemove = (addressToRemove: SelectOption) => {
    setSelectedControls((prevSelectedAddresses) =>
      prevSelectedAddresses.filter((address) => address.value !== addressToRemove.value),
    );
  };

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        onClose();
        reset();
        setSelectedControls([]);
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
          {selectedControls.length > 0 && (
            <VStack alignItems={"flex-start"} mt={6}>
              <Text>External control selected:</Text>
              <HStack layerStyle="whiteContainer" noOfLines={20} lineHeight={10}>
                {selectedControls.map((item) => {
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
          <Button isDisabled={isDisable} isLoading={isLoading} type="submit" onClick={handleSubmit(onSubmit)}>
            {tCreate("form.add")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
