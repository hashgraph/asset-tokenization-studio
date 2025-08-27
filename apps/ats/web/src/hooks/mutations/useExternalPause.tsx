import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'io-bricks-ui';
import { useTranslation } from 'react-i18next';
import SDKService from '../../services/SDKService';
import {
  AddExternalPauseRequest,
  SetPausedMockRequest,
  UpdateExternalPausesRequest,
} from '@hashgraph/asset-tokenization-sdk';
import { GET_EXTERNAL_PAUSES_COUNT } from '../queries/useExternalPause';

export const useUpdateExternalPauses = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (req: UpdateExternalPausesRequest) => SDKService.updateExternalPauses(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_EXTERNAL_PAUSES_COUNT(variables.securityId)],
        });

        console.log(
          'SDK message --> Update external pause operation success: ',
          data,
        );
      },
      onError: (error) => {
        console.log(
          'SDK message --> Update external pause operation error: ',
          error,
        );
      },
    },
  );
};

export const useAddExternalPause = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('externalPause', {
    keyPrefix: 'messages',
  });

  return useMutation(
    (req: AddExternalPauseRequest) => SDKService.addExternalPause(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_EXTERNAL_PAUSES_COUNT(variables.securityId)],
        });

        console.log(
          'SDK message --> Add external pause operation success: ',
          data,
        );

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t('addExternalPause.success'),
          description: t('addExternalPause.descriptionSuccess'),
          variant: 'subtle',
          status: 'success',
        });
      },
      onError: (error) => {
        console.log(
          'SDK message --> Add external pause operation error: ',
          error,
        );

        toast.show({
          duration: 3000,
          title: t('addExternalPause.error'),
          description: t('addExternalPause.descriptionFailed'),
          variant: 'subtle',
          status: 'error',
        });
      },
    },
  );
};

export const useRemoveExternalPause = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('externalPause', {
    keyPrefix: 'list.messages',
  });

  return useMutation(
    (req: AddExternalPauseRequest) => SDKService.removeExternalPause(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_EXTERNAL_PAUSES_COUNT(variables.securityId)],
        });

        console.log(
          'SDK message --> Remove external pause operation success: ',
          data,
        );

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t('removeExternalPause.success'),
          description: t('removeExternalPause.descriptionSuccess'),
          variant: 'subtle',
          status: 'success',
        });
      },
      onError: (error) => {
        console.log(
          'SDK message --> Remove external pause operation error: ',
          error,
        );

        toast.show({
          duration: 3000,
          title: t('removeExternalPause.error'),
          description: t('removeExternalPause.descriptionFailed'),
          variant: 'subtle',
          status: 'error',
        });
      },
    },
  );
};

export const useSetPausedMock = () => {
  const toast = useToast();
  const { t } = useTranslation('externalPause', {
    keyPrefix: 'list.messages',
  });

  return useMutation(
    (req: SetPausedMockRequest) => SDKService.setPausedMock(req),
    {
      onSuccess(data) {
        console.log(
          'SDK message --> Set external pause operation success: ',
          data,
        );

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t('changeState.success'),
          description: t('changeState.descriptionSuccess'),
          variant: 'subtle',
          status: 'success',
        });
      },
      onError: (error) => {
        console.log(
          'SDK message --> Set external pause operation error: ',
          error,
        );

        toast.show({
          duration: 3000,
          title: t('changeState.error'),
          description: t('changeState.descriptionFailed'),
          variant: 'subtle',
          status: 'error',
        });
      },
    },
  );
};

export const useCreatePauseMock = () => {
  const toast = useToast();
  const { t } = useTranslation('externalPause', {
    keyPrefix: 'list.messages',
  });

  return useMutation(() => SDKService.createMock(), {
    onSuccess(data) {
      console.log('SDK message --> Pause mock created success: ', data);

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: t('createMock.success'),
        description: t('createMock.descriptionSuccess'),
        variant: 'subtle',
        status: 'success',
      });
    },
    onError: (error) => {
      console.log('SDK message --> Pause mock created error: ', error);

      toast.show({
        duration: 3000,
        title: t('createMock.error'),
        description: t('createMock.descriptionFailed'),
        variant: 'subtle',
        status: 'error',
      });
    },
  });
};
