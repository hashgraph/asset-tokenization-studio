import { useMutation, useQueryClient } from '@tanstack/react-query';
import SDKService from '../../services/SDKService';
import {
  CreateHoldByPartitionRequest,
  CreateHoldFromByPartitionRequest,
  ExecuteHoldByPartitionRequest,
  ReclaimHoldByPartitionRequest,
  ReleaseHoldByPartitionRequest,
} from '@hashgraph/asset-tokenization-sdk';
import { useTranslation } from 'react-i18next';
import { useToast } from 'io-bricks-ui';
import { GET_HOLDS } from '../queries/useGetHolds';

export const useCreateHoldFromByPartition = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('security', {
    keyPrefix: 'details.hold.messages',
  });

  return useMutation(
    (req: CreateHoldFromByPartitionRequest) =>
      SDKService.createHoldFromByPartition(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_HOLDS(variables.securityId, variables.targetId)],
        });

        console.log('SDK message --> Hold operation success: ', data);

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
        console.log('SDK message --> Hold operation error: ', error);

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

export const useCreateHoldByPartition = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('security', {
    keyPrefix: 'details.hold.messages',
  });

  return useMutation(
    (req: CreateHoldByPartitionRequest) =>
      SDKService.createHoldByPartition(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_HOLDS(variables.securityId, variables.targetId)],
        });

        console.log('SDK message --> Hold operation success: ', data);

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
        console.log('SDK message --> Hold operation error: ', error);

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

export const useForceCreateHoldFromByPartition = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('security', {
    keyPrefix: 'details.hold.messages',
  });

  return useMutation(
    (req: CreateHoldFromByPartitionRequest) =>
      SDKService.controllerCreateHoldByPartition(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_HOLDS(variables.securityId, variables.targetId)],
        });

        console.log('SDK message --> Hold operation success: ', data);

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
        console.log('SDK message --> Hold operation error: ', error);

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

export const useReleaseHoldByPartition = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('security', {
    keyPrefix: 'details.hold.messages',
  });

  return useMutation(
    (req: ReleaseHoldByPartitionRequest) =>
      SDKService.releaseHoldByPartition(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_HOLDS(variables.securityId, variables.targetId)],
        });

        console.log('SDK message --> Hold operation success: ', data);

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
        console.log('SDK message --> Hold operation error: ', error);

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

export const useExecuteHoldByPartition = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('security', {
    keyPrefix: 'details.hold.messages',
  });

  return useMutation(
    (req: ExecuteHoldByPartitionRequest) =>
      SDKService.executeHoldByPartition(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_HOLDS(variables.securityId, variables.targetId)],
        });

        console.log('SDK message --> Hold operation success: ', data);

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
        console.log('SDK message --> Hold operation error: ', error);

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

export const useReclaimHoldByPartition = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('security', {
    keyPrefix: 'details.hold.messages',
  });

  return useMutation(
    (req: ReclaimHoldByPartitionRequest) =>
      SDKService.reclaimHoldByPartition(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [GET_HOLDS(variables.securityId, variables.targetId)],
        });

        console.log('SDK message --> Hold operation success: ', data);

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
        console.log('SDK message --> Hold operation error: ', error);

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
