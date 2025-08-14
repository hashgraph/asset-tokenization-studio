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
import { Button, InputController, PhosphorIcon, Text } from 'io-bricks-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useGrantKYC } from '../../../../hooks/mutations/useKYC';
import { GrantKycRequest } from '@hashgraph/asset-tokenization-sdk';
import { useParams } from 'react-router-dom';
import { FileArchive } from '@phosphor-icons/react';
import { useRef, useState } from 'react';
import { isValidHederaId, required } from '../../../../utils/rules';

interface FormValues {
  accountId: string;
  vcFile: string;
}

interface KYCModalProps extends Omit<ModalProps, 'children'> {}

export const KYCModal = ({ isOpen, onClose }: KYCModalProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { id: securityId = '' } = useParams();

  const { t: tCreate } = useTranslation('security', {
    keyPrefix: 'details.kyc.create',
  });

  const {
    control,
    formState: { isValid },
    handleSubmit,
    setValue,
    reset,
    watch,
  } = useForm<FormValues>({
    mode: 'onChange',
  });

  const { mutate } = useGrantKYC();

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64Data = reader.result.split(',')[1];
          if (base64Data) {
            setValue('vcFile', base64Data, { shouldValidate: true });
          }
        }
      };
    }
  };

  const onSubmit = (values: FormValues) => {
    setIsLoading(true);

    const request = new GrantKycRequest({
      securityId,
      targetId: values.accountId,
      vcBase64: values.vcFile,
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

  const isDisable = !isValid || !watch('vcFile');

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={() => {
        setFileName('');
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
              id="accountId"
              label={tCreate('form.account.label')}
              placeholder={tCreate('form.account.placeholder')}
              isRequired={true}
              rules={{
                required,
                validate: { isValidHederaId: isValidHederaId },
              }}
            />
            <HStack w={'full'}>
              <input
                ref={fileInputRef}
                type="file"
                name="vcFile"
                id="vcFile"
                style={{ display: 'none' }}
                onChange={onFileChange}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<PhosphorIcon as={FileArchive} />}
                variant={'secondary'}
              >
                {tCreate('form.vc.placeholder')}
              </Button>
              <Text>{fileName}</Text>
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={isDisable}
            isLoading={isLoading}
            type="submit"
            onClick={handleSubmit(onSubmit)}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
