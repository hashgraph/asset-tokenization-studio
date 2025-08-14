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
} from '@chakra-ui/react';
import { Button, InputController } from 'io-bricks-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ExternalControl } from '../ExternalControlList';
import {
  useAddToBlackListMock,
  useAddToWhiteListMock,
} from '../../../hooks/mutations/useExternalControl';
import {
  AddToBlackListMockRequest,
  AddToWhiteListMockRequest,
} from '@hashgraph/asset-tokenization-sdk';

interface FormValues {
  accountId: string;
}

interface AddAddressModalProps extends Omit<ModalProps, 'children'> {
  externalControlSelected?: ExternalControl;
}

export const AddAddressModal = ({
  externalControlSelected,
  isOpen,
  onClose,
}: AddAddressModalProps) => {
  const { t: tAddAddress } = useTranslation('externalControl', {
    keyPrefix: 'addAddress',
  });

  const { control, handleSubmit, reset } = useForm<FormValues>({
    mode: 'onChange',
  });

  const {
    mutateAsync: addToBlackListMutate,
    isLoading: isLoadingAddToBlackListMockMutate,
  } = useAddToBlackListMock();
  const {
    mutateAsync: addToWhiteListMutate,
    isLoading: isLoadingAddToWhiteListMockMutate,
  } = useAddToWhiteListMock();

  const onSubmit = (values: FormValues) => {
    if (externalControlSelected?.type === 'blacklist') {
      return addToBlackListMutate(
        new AddToBlackListMockRequest({
          contractId: externalControlSelected.address,
          targetId: values.accountId,
        }),
      ).finally(onClose);
    }

    if (externalControlSelected?.type === 'whitelist') {
      return addToWhiteListMutate(
        new AddToWhiteListMockRequest({
          contractId: externalControlSelected.address,
          targetId: values.accountId,
        }),
      ).finally(onClose);
    }
  };

  const isLoading =
    isLoadingAddToBlackListMockMutate || isLoadingAddToWhiteListMockMutate;

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
      <ModalContent bgColor={'white'}>
        <ModalHeader>{tAddAddress('title')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4}>
            <InputController
              control={control}
              id="accountId"
              label={tAddAddress('input.label')}
              placeholder={tAddAddress('input.placeholder')}
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
            {tAddAddress('add')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
