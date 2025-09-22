import { useMutation, useQueryClient } from '@tanstack/react-query';
import SDKService from '../../services/SDKService';
import {
  AddBeneficiaryRequest,
  RemoveBeneficiaryRequest,
  UpdateBeneficiaryDataRequest,
} from '@hashgraph/asset-tokenization-sdk';
import { useToast } from 'io-bricks-ui';
import { useTranslation } from 'react-i18next';
import { GET_BENEFICIARY_LIST } from '../queries/useBeneficiaries';

export const useAddBeneficiary = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('security', {
    keyPrefix: 'details.beneficiaries.create.messages',
  });

  return useMutation(
    (req: AddBeneficiaryRequest) => SDKService.addBeneficiary(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_BENEFICIARY_LIST(variables.securityId)],
        });

        console.log(
          'SDK message --> Add beneficiary operation success: ',
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
        console.log('SDK message --> Add beneficiary operation error: ', error);

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

export const useUpdateBeneficiary = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('security', {
    keyPrefix: 'details.beneficiaries.update.messages',
  });

  return useMutation(
    (req: UpdateBeneficiaryDataRequest) =>
      SDKService.updateBeneficiaryData(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_BENEFICIARY_LIST(variables.securityId)],
        });

        console.log(
          'SDK message --> Update beneficiary operation success: ',
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
          'SDK message --> Update beneficiary operation error: ',
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

export const useRemoveBeneficiary = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('security', {
    keyPrefix: 'details.beneficiaries.remove.messages',
  });

  return useMutation(
    (req: RemoveBeneficiaryRequest) => SDKService.removeBeneficiary(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_BENEFICIARY_LIST(variables.securityId)],
        });

        console.log(
          'SDK message --> Remove beneficiary operation success: ',
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
          'SDK message --> Remove beneficiary operation error: ',
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
