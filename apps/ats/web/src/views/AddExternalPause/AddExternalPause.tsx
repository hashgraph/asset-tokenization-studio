import { Box, HStack, Stack, VStack } from '@chakra-ui/react';
import { History } from '../../components/History';
import { RouteName } from '../../router/RouteName';
import { useTranslation } from 'react-i18next';
import { RoutePath } from '../../router/RoutePath';
import { Button, InputController, Text, useToast } from 'io-bricks-ui';
import { isHederaValidAddress, required } from '../../utils/rules';
import { useForm } from 'react-hook-form';
import { RouterManager } from '../../router/RouterManager';
import { useIsPauseMock } from '../../hooks/queries/useExternalPause';
import { IsPausedMockRequest } from '@hashgraph/asset-tokenization-sdk';
import { useExternalPauseStore } from '../../store/externalPauseStore';
import { useState } from 'react';

export interface FormValues {
  externalPauseId: string;
}

export const AddExternalPause = () => {
  const toast = useToast();

  const { t: tRoutes } = useTranslation('routes');

  const { t: tAdd } = useTranslation('externalPause', {
    keyPrefix: 'add',
  });
  const { t: tMessages } = useTranslation('externalPause', {
    keyPrefix: 'messages',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addExternalPause } = useExternalPauseStore();

  const {
    control,
    formState: { isValid },
    handleSubmit,
    watch,
  } = useForm<FormValues>({
    mode: 'onChange',
  });

  const { refetch } = useIsPauseMock(
    new IsPausedMockRequest({
      contractId: watch('externalPauseId'),
    }),
    {
      enabled: false,
      retry: false,
    },
  );

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      const result = await refetch();

      if (result.error) {
        throw new Error();
      }

      if (result.data !== undefined) {
        addExternalPause({
          address: values.externalPauseId,
          isPaused: result.data,
        });
        toast.show({
          status: 'success',
          title: tMessages('addExternalPause.success'),
          description: tMessages('addExternalPause.descriptionSuccess'),
        });
      }
    } catch (_error) {
      toast.show({
        status: 'error',
        title: tMessages('addExternalPause.error'),
        description: tMessages('addExternalPause.descriptionFailed'),
      });
    } finally {
      setIsSubmitting(false);
      RouterManager.to(RouteName.ExternalPauseList);
    }
  };

  return (
    <Stack gap={6} flex={1}>
      <History
        label={tRoutes(RouteName.AddExternalPause)}
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
              id="externalPauseId"
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
