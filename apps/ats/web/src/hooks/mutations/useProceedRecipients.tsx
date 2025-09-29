import { useMutation, useQueryClient } from '@tanstack/react-query';
import SDKService from '../../services/SDKService';
import {
  AddProceedRecipientRequest,
  RemoveProceedRecipientRequest,
  UpdateProceedRecipientDataRequest,
} from '@hashgraph/asset-tokenization-sdk';
import { useToast } from 'io-bricks-ui';
import { useTranslation } from 'react-i18next';
import { GET_PROCEED_RECIPIENT_LIST } from '../queries/useProceedRecipients';

export const useAddProceedRecipient = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('security', {
    keyPrefix: 'details.proceedRecipients.create.messages',
  });

  return useMutation(
    (req: AddProceedRecipientRequest) => SDKService.addProceedRecipient(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_PROCEED_RECIPIENT_LIST(variables.securityId)],
        });

        console.log(
          'SDK message --> Add proceed recipient operation success: ',
          data,
        );

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t('success'),
          description: t('descriptionSuccess'),
          variant: 'subtle',
          status: 'success',
        });
      },
      onError: (error) => {
        console.log(
          'SDK message --> Add proceed recipient operation error: ',
          error,
        );

        toast.show({
          duration: 3000,
          title: t('error'),
          description: t('descriptionFailed'),
          variant: 'subtle',
          status: 'error',
        });
      },
    },
  );
};

export const useUpdateProceedRecipient = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('security', {
    keyPrefix: 'details.proceedRecipients.update.messages',
  });

  return useMutation(
    (req: UpdateProceedRecipientDataRequest) =>
      SDKService.updateProceedRecipientData(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_PROCEED_RECIPIENT_LIST(variables.securityId)],
        });

        console.log(
          'SDK message --> Update proceed recipient operation success: ',
          data,
        );

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t('success'),
          description: t('descriptionSuccess'),
          variant: 'subtle',
          status: 'success',
        });
      },
      onError: (error) => {
        console.log(
          'SDK message --> Update proceed recipient operation error: ',
          error,
        );

        toast.show({
          duration: 3000,
          title: t('error'),
          description: t('descriptionFailed'),
          variant: 'subtle',
          status: 'error',
        });
      },
    },
  );
};

export const useRemoveProceedRecipient = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('security', {
    keyPrefix: 'details.proceedRecipients.remove.messages',
  });

  return useMutation(
    (req: RemoveProceedRecipientRequest) =>
      SDKService.removeProceedRecipient(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_PROCEED_RECIPIENT_LIST(variables.securityId)],
        });

        console.log(
          'SDK message --> Remove proceed recipient operation success: ',
          data,
        );

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t('success'),
          description: t('descriptionSuccess'),
          variant: 'subtle',
          status: 'success',
        });
      },
      onError: (error) => {
        console.log(
          'SDK message --> Remove proceed recipient operation error: ',
          error,
        );

        toast.show({
          duration: 3000,
          title: t('error'),
          description: t('descriptionFailed'),
          variant: 'subtle',
          status: 'error',
        });
      },
    },
  );
};
