import { Box, Stack, useDisclosure } from '@chakra-ui/react';
import {
  Button,
  PhosphorIcon,
  PopUp,
  Table,
  Text,
  useToast,
} from 'io-bricks-ui';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WarningCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import {
  DATE_TIME_FORMAT,
  DEFAULT_PARTITION,
} from '../../../../utils/constants';
import { formatDate } from '../../../../utils/format';
import { useSecurityStore } from '../../../../store/securityStore';
import {
  ClearingOperationViewModel,
  GET_CLEARING_OPERATIONS_LIST,
  useGetClearingOperations,
} from '../../../../hooks/queries/useClearingOperations';
import { ReclaimClearingOperationByPartitionRequest } from '@hashgraph/asset-tokenization-sdk';
import { useWalletStore } from '../../../../store/walletStore';
import { useReclaimClearingByPartition } from '../../../../hooks/mutations/useClearingOperations';
import { useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/table-core';

export const ClearingOperationsList = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { isOpen, onClose, onOpen } = useDisclosure();

  const { id: securityId = '' } = useParams();

  const { details } = useSecurityStore();
  const { address } = useWalletStore();
  const [_isMutating, setIsMutating] = useState(false);
  const [clearOperationSelected, setClearOperationSelected] =
    useState<ClearingOperationViewModel>();
  const [isReclaiming, setIsReclaiming] = useState(false);

  const { t: tList } = useTranslation('security', {
    keyPrefix: 'details.clearingOperations.list',
  });
  const { t: tActions } = useTranslation('security', {
    keyPrefix: 'details.clearingOperations.actions.confirmReclaimPopUp',
  });
  const { t: tMessages } = useTranslation('security', {
    keyPrefix: 'details.clearingOperations.messages',
  });

  const { mutate } = useReclaimClearingByPartition();

  const onSubmit = () => {
    setIsMutating(true);

    const request = new ReclaimClearingOperationByPartitionRequest({
      clearingId: Number(clearOperationSelected?.id),
      clearingOperationType: Number(clearOperationSelected?.operationType),
      partitionId: DEFAULT_PARTITION,
      securityId,
      targetId: address,
    });

    mutate(request, {
      onSettled() {
        setIsMutating(false);
      },
      onSuccess(_data, variables) {
        const queryKey = [GET_CLEARING_OPERATIONS_LIST(variables.securityId)];

        queryClient.setQueryData(
          queryKey,
          (oldData: ClearingOperationViewModel[] | undefined) => {
            if (!oldData) return [];
            return oldData.filter((op) => op.id !== variables.clearingId);
          },
        );

        toast.show({
          duration: 3000,
          title: tMessages('success'),
          description: tMessages('descriptionSuccess'),
          variant: 'subtle',
          status: 'success',
        });
      },
    });

    setIsMutating(false);
  };

  const request = {
    securityId,
    targetId: address,
    partitionId: DEFAULT_PARTITION,
    start: 0,
    end: 50,
  };

  const { data: clearingOperations, isLoading: isLoadingClearingOperations } =
    useGetClearingOperations(request);

  const columnsHelper = createColumnHelper<ClearingOperationViewModel>();

  const columnId = columnsHelper.accessor('id', {
    header: tList('id'),
    enableSorting: false,
  });

  const columnAmount = columnsHelper.accessor('amount', {
    header: tList('amount'),
    enableSorting: false,
    cell({ getValue }) {
      return (
        <Box>
          {getValue()} {details?.symbol}
        </Box>
      );
    },
  });

  const columnExpirationDate = columnsHelper.accessor('expirationDate', {
    header: tList('expirationDate'),
    enableSorting: false,
    cell({ getValue }) {
      const formattedDate = formatDate(Number(getValue()), DATE_TIME_FORMAT);
      return <Box>{formattedDate}</Box>;
    },
  });

  const columnActions = columnsHelper.display({
    id: 'remove',
    header: tList('actions'),
    enableSorting: false,
    size: 100,
    cell({ row: { original } }) {
      const isExpirationDateResearch =
        Number(original.expirationDate) < Date.now();

      const isReclaimable = isExpirationDateResearch;

      if (!isReclaimable) return;

      return (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setClearOperationSelected(original);
            onOpen();
          }}
          variant="table"
          size="xs"
          disabled={isReclaiming && clearOperationSelected?.id === original.id}
          isLoading={isReclaiming && clearOperationSelected?.id === original.id}
        >
          {tList('reclaim')}
        </Button>
      );
    },
  });

  const clearingOperationsTransferColumns = [
    columnId,
    columnAmount,
    columnExpirationDate,
    columnsHelper.accessor('destination', {
      header: tList('targetId'),
      enableSorting: false,
      cell({ getValue }) {
        const value = getValue();
        return <Box>{value ?? '-'}</Box>;
      },
    }),
    columnActions,
  ];

  const clearingOperationsRedeemColumns = [
    columnId,
    columnAmount,
    columnExpirationDate,
    columnActions,
  ];

  const clearingOperationsHoldColumns = [
    columnId,
    columnAmount,
    columnExpirationDate,
    columnsHelper.accessor('holdExpirationDate', {
      header: tList('holdExpirationDate'),
      enableSorting: false,
      cell({ getValue }) {
        const value = getValue();
        if (!value) {
          return <Box>-</Box>;
        }
        const formattedDate = formatDate(Number(value), DATE_TIME_FORMAT);

        return <Box>{formattedDate}</Box>;
      },
    }),
    columnsHelper.accessor('holdEscrow', {
      header: tList('escrowAddress'),
      enableSorting: false,
      cell({ getValue }) {
        const value = getValue();
        return <Box>{value ?? '-'}</Box>;
      },
    }),
    columnActions,
  ];

  return (
    <Stack w="full" h="full">
      <PopUp
        id="confirm-clearing-operation-list-popup"
        isOpen={isOpen}
        onClose={onClose}
        icon={<PhosphorIcon as={WarningCircle} size="md" />}
        title={tActions('title')}
        description={tActions('description')}
        confirmText={tActions('confirmText')}
        cancelText={tActions('cancelText')}
        onConfirm={() => {
          setIsReclaiming(true);
          onSubmit();
          onClose();
        }}
        onCancel={() => {
          setIsReclaiming(false);
          onClose();
        }}
      />
      <Stack w="full" h="full" bg="neutral.50" borderRadius={1} pt={6} gap={8}>
        <Stack w="full" h="full" pt={6} gap={4}>
          <Text textStyle="ElementsSemiboldLG" color="neutral.light">
            {tList('clearingOperationsTransfer')}
          </Text>
          <Table
            name="clearingOperationsTransfer-list"
            columns={clearingOperationsTransferColumns}
            data={
              clearingOperations?.filter((co) => co.operationType === 0) ?? []
            }
            isLoading={isLoadingClearingOperations}
          />
        </Stack>
        <Stack w="full" h="full" pt={6} gap={4}>
          <Text textStyle="ElementsSemiboldLG" color="neutral.light">
            {tList('clearingOperationsRedeem')}
          </Text>
          <Table
            name="clearingOperationsRedeem-list"
            columns={clearingOperationsRedeemColumns}
            data={
              clearingOperations?.filter((co) => co.operationType === 1) ?? []
            }
            isLoading={isLoadingClearingOperations}
          />
        </Stack>
        <Stack w="full" h="full" pt={6} gap={4}>
          <Text textStyle="ElementsSemiboldLG" color="neutral.light">
            {tList('clearingOperationsHold')}
          </Text>
          <Table
            name="clearingOperationsHold-list"
            columns={clearingOperationsHoldColumns}
            data={
              clearingOperations?.filter((co) => co.operationType === 2) ?? []
            }
            isLoading={isLoadingClearingOperations}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};
