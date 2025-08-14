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
} from '@chakra-ui/react';
import {
  Button,
  PhosphorIcon,
  SelectController,
  Tag,
  Text,
  useToast,
} from 'io-bricks-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useExternalPauseStore } from '../../../../store/externalPauseStore';
import { X } from '@phosphor-icons/react';
import { useUpdateExternalPauses } from '../../../../hooks/mutations/useExternalPause';
import { UpdateExternalPausesRequest } from '@hashgraph/asset-tokenization-sdk';

type SelectOption = {
  value: string;
  label: string;
};

interface FormValues {
  accountId: string;
  vcFile: string;
}

type AddExternalPauseModalProps = Omit<ModalProps, 'children'>;

export const AddExternalPauseModal = ({
  isOpen,
  onClose,
}: AddExternalPauseModalProps) => {
  const toast = useToast();

  const [selectedPauses, setSelectedPauses] = useState<SelectOption[]>([]);

  const { id: securityId = '' } = useParams();

  const { t: tCreate } = useTranslation('security', {
    keyPrefix: 'details.externalPause.create',
  });
  const { t: tMessage } = useTranslation('externalPause', {
    keyPrefix: 'messages',
  });

  const { externalPauses } = useExternalPauseStore();

  const {
    mutateAsync: updateExternalPauses,
    isLoading: isLoadingUpdateExternalPauses,
  } = useUpdateExternalPauses();

  const options = externalPauses.map((external) => ({
    label: external.address,
    value: external.address,
  }));

  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: 'onChange',
  });

  const onSubmit = (_values: FormValues) => {
    updateExternalPauses(
      new UpdateExternalPausesRequest({
        securityId,
        externalPausesAddresses: selectedPauses.map((option) => option.value),
        actives: selectedPauses.map(() => true),
      }),
    ).finally(() => {
      onClose();
      toast.show({
        duration: 3000,
        title: tMessage('addExternalPause.success'),
        description: tMessage('addExternalPause.descriptionSuccess'),
        variant: 'subtle',
        status: 'success',
      });
    });
  };

  const isDisable = selectedPauses.length === 0;

  const handleSelectChange = (selectedOption: SelectOption) => {
    setSelectedPauses((prevSelectedOptions) => {
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
    setSelectedPauses((prevSelectedAddresses) =>
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
        setSelectedPauses([]);
      }}
    >
      <ModalOverlay />
      <ModalContent bgColor={'white'}>
        <ModalHeader>{tCreate('title')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4}>
            <SelectController
              control={control}
              id="accountId"
              label={tCreate('form.selector.label')}
              placeholder={tCreate('form.selector.placeholder')}
              options={options}
              setsFullOption
              onChange={(option) => handleSelectChange(option as SelectOption)}
            />
          </VStack>
          {selectedPauses.length > 0 && (
            <VStack alignItems={'flex-start'} mt={6}>
              <Text>External pauses selected:</Text>
              <HStack
                layerStyle="whiteContainer"
                noOfLines={20}
                lineHeight={10}
              >
                {selectedPauses.map((item) => {
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
            isLoading={isLoadingUpdateExternalPauses}
            type="submit"
            onClick={handleSubmit(onSubmit)}
          >
            {tCreate('form.add')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
