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
import { Button, InputController } from 'io-bricks-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { isValidHederaId, required } from '../../../../utils/rules';
import { useAddBeneficiary } from '../../../../hooks/mutations/useBeneficiaries';
import { AddBeneficiaryRequest } from '@hashgraph/asset-tokenization-sdk';

interface FormValues {
  address: string;
  data?: string;
}

interface AddBeneficiaryModalProps extends Omit<ModalProps, 'children'> {}

export const AddBeneficiaryModal = ({
  isOpen,
  onClose,
}: AddBeneficiaryModalProps) => {
  const { id: securityId = '' } = useParams();

  const { t: tCreate } = useTranslation('security', {
    keyPrefix: 'details.beneficiaries.create',
  });

  const {
    control,
    formState: { isValid },
    handleSubmit,
    reset,
  } = useForm<FormValues>({
    mode: 'onChange',
  });

  const { mutate: addBeneficiaryMutation, isPending: isPendingAddBeneficiary } =
    useAddBeneficiary();

  const onSubmit = (values: FormValues) => {
    const request = new AddBeneficiaryRequest({
      securityId,
      beneficiaryId: values.address,
      data: values.data ?? '',
    });

    addBeneficiaryMutation(request, {
      onSettled() {
        onClose();
      },
      onSuccess() {
        reset();
      },
    });
  };

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        reset();
        onClose();
      }}
    >
      <ModalOverlay />
      <ModalContent bgColor={'white'}>
        <ModalHeader>{tCreate('title')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4}>
            <InputController
              control={control}
              id="address"
              label={tCreate('form.address.label')}
              placeholder={tCreate('form.address.placeholder')}
              isRequired={true}
              rules={{
                required,
                validate: { isValidHederaId: isValidHederaId },
              }}
            />
            <InputController
              control={control}
              id="data"
              label={tCreate('form.data.label')}
              placeholder={tCreate('form.data.placeholder')}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack gap={2}>
            <Button
              type="submit"
              onClick={() => {
                reset();
                onClose();
              }}
              variant={'secondary'}
            >
              {tCreate('buttons.cancel')}
            </Button>
            <Button
              isDisabled={!isValid || isPendingAddBeneficiary}
              isLoading={isPendingAddBeneficiary}
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              {tCreate('buttons.add')}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
