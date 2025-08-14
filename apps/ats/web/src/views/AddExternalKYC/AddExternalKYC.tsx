import { Box, HStack, Stack, VStack } from '@chakra-ui/react';
import { History } from '../../components/History';
import { RouteName } from '../../router/RouteName';
import { useTranslation } from 'react-i18next';
import { RoutePath } from '../../router/RoutePath';
import { Button, InputController, Text, useToast } from 'io-bricks-ui';
import { isHederaValidAddress, required } from '../../utils/rules';
import { useForm } from 'react-hook-form';
import { RouterManager } from '../../router/RouterManager';
import { useState } from 'react';
import { useExternalKYCStore } from '../../store/externalKYCStore';

export interface FormValues {
  externalKYCId: string;
}

export const AddExternalKYC = () => {
  const toast = useToast();

  const { t: tRoutes } = useTranslation('routes');

  const { t: tAdd } = useTranslation('externalKYC', {
    keyPrefix: 'add',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addExternalKYC } = useExternalKYCStore();

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<FormValues>({
    mode: 'onChange',
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    addExternalKYC({
      address: values.externalKYCId,
    });

    toast.show({
      status: 'success',
      title: tAdd('messages.addExternalKYC.success'),
      description: tAdd('messages.addExternalKYC.descriptionSuccess'),
    });

    setIsSubmitting(false);

    RouterManager.to(RouteName.ExternalKYCList);
  };

  return (
    <Stack gap={6} flex={1}>
      <History
        label={tRoutes(RouteName.AddExternalKYC)}
        excludePaths={[RoutePath.DASHBOARD]}
      />
      <Box
        layerStyle={'container'}
        w={'full'}
        h={'full'}
        flex={1}
        alignItems={'center'}
      >
        <Stack
          gap={2}
          alignItems={'start'}
          justifyContent={'center'}
          maxW={500}
          justifySelf={'center'}
        >
          <Text textStyle="HeadingMediumLG">{tAdd('title')}</Text>
          <Text textStyle="BodyTextRegularMD">{tAdd('subtitle')}</Text>
          <Text textStyle="ElementsRegularSM" py={6}>
            {tAdd('mandatoryFields')}
          </Text>
          <Text textStyle="BodyTextRegularSM" mt={4}>
            {tAdd('input.id.label')}
          </Text>
          <VStack w="450px" alignItems="flex-start">
            <InputController
              id="externalKYCId"
              control={control}
              placeholder={tAdd('input.id.placeholder')}
              backgroundColor="neutral.white"
              size="md"
              rules={{
                required,
                validate: { isHederaValidAddress },
              }}
            />
          </VStack>
          <HStack pt={20} justifyContent={'flex-end'} w={'full'}>
            <Button
              variant={'secondary'}
              size={'md'}
              onClick={() => RouterManager.goBack()}
            >
              {tAdd('cancel')}
            </Button>
            <Button
              size={'md'}
              onClick={handleSubmit(onSubmit)}
              isDisabled={!isValid || isSubmitting}
              isLoading={isSubmitting}
            >
              {tAdd('create')}
            </Button>
          </HStack>
        </Stack>
      </Box>
    </Stack>
  );
};
