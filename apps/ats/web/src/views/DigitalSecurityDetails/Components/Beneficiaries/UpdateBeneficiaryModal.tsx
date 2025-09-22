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
import { Button, Input, InputController } from 'io-bricks-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useUpdateBeneficiary } from '../../../../hooks/mutations/useBeneficiaries';
import { UpdateBeneficiaryDataRequest } from '@hashgraph/asset-tokenization-sdk';
import { isValidHex } from '../../../../utils/rules';

interface FormValues {
  address: string;
  data?: string;
}

interface UpdateBeneficiaryModalProps extends Omit<ModalProps, 'children'> {
  beneficiaryId: string;
}

export const UpdateBeneficiaryModal = ({
  isOpen,
  onClose,
  beneficiaryId,
}: UpdateBeneficiaryModalProps) => {
  const { id: securityId = '' } = useParams();

  const { t: tUpdate } = useTranslation('security', {
    keyPrefix: 'details.beneficiaries.update',
  });

  const {
    control,
    formState: { isValid },
    handleSubmit,
    reset,
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      address: beneficiaryId,
    },
  });

  const {
    mutate: updateBeneficiaryMutation,
    isPending: isPendingUpdateBeneficiary,
  } = useUpdateBeneficiary();

  const onSubmit = (values: FormValues) => {
    const request = new UpdateBeneficiaryDataRequest({
      securityId,
      beneficiaryId,
      data: values.data ?? '',
    });

    updateBeneficiaryMutation(request, {
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
        <ModalHeader>{tUpdate('title')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4}>
            <Input
              label={tUpdate('form.address.label')}
              isRequired={true}
              isDisabled={true}
              value={beneficiaryId}
            />
            <InputController
              control={control}
              id="data"
              label={tUpdate('form.data.label')}
              placeholder={tUpdate('form.data.placeholder')}
              isRequired={false}
              rules={{
                validate: (value: string) =>
                  !value ||
                  isValidHex(value) ||
                  tUpdate('form.data.invalidHexFormat'),
              }}
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
              {tUpdate('buttons.cancel')}
            </Button>
            <Button
              isDisabled={!isValid || isPendingUpdateBeneficiary}
              isLoading={isPendingUpdateBeneficiary}
              type="submit"
              onClick={handleSubmit(onSubmit)}
            >
              {tUpdate('buttons.update')}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
