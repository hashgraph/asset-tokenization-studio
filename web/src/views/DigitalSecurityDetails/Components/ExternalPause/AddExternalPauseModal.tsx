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
  SelectOption,
  Tag,
  Text,
} from "io-bricks-ui";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useExternalPauseStore } from "../../../../store/externalPauseStore";
import { X } from "@phosphor-icons/react";

interface FormValues {
  accountId: string;
  vcFile: string;
}

interface AddExternalPauseModalProps extends Omit<ModalProps, "children"> {}

export const AddExternalPauseModal = ({
  isOpen,
  onClose,
}: AddExternalPauseModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPauses, setSelectedPauses] = useState<string[]>([]);

  const { id: securityId = "" } = useParams();

  const { t: tCreate } = useTranslation("security", {
    keyPrefix: "details.externalPause.create",
  });

  const { externalPauses } = useExternalPauseStore();

  // TODO: add filter
  const options = externalPauses.map((external) => ({
    label: external.address,
    value: external.address,
  }));

  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: "onChange",
  });

  const onSubmit = (_values: FormValues) => {
    // mutate(request, {
    //   onSettled() {
    //     setIsLoading(false);
    //   },
    //   onSuccess() {
    //     onClose();
    //   },
    // });
  };

  const isDisable = selectedPauses.length === 0;

  const handleSelectChange = (selectedOptions: SelectOption) => {
    console.log("selectedOptions", selectedOptions);

    setSelectedPauses((prevSelectedAddresses) => [
      ...new Set([...prevSelectedAddresses, ...selectedOptions.value]),
    ]);
  };

  const handleTagRemove = (addressToRemove: string) => {
    setSelectedPauses((prevSelectedAddresses) =>
      prevSelectedAddresses.filter((address) => address !== addressToRemove),
    );
  };
  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        onClose();
        reset();
        setSelectedPauses([]);
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
          {selectedPauses.length > 0 && (
            <VStack alignItems={"flex-start"} mt={6}>
              <Text>External pauses selected:</Text>
              <HStack
                layerStyle="whiteContainer"
                noOfLines={20}
                lineHeight={10}
              >
                {selectedPauses.map((item) => {
                  return (
                    <Tag
                      key={item}
                      label={item}
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
            isLoading={isLoading}
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
