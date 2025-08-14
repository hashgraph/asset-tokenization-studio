import { Checkbox, HStack, Stack, useDisclosure } from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/table-core';
import {
  Button,
  PhosphorIcon,
  PopUp,
  Table,
  Text,
  useToast,
} from 'io-bricks-ui';
import { useTranslation } from 'react-i18next';
import { AddExternalPauseModal } from './AddExternalPauseModal';
import { Trash } from '@phosphor-icons/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetExternalPauses } from '../../../../hooks/queries/useExternalPause';
import {
  useRemoveExternalPause,
  useUpdateExternalPauses,
} from '../../../../hooks/mutations/useExternalPause';
import {
  RemoveExternalPauseRequest,
  UpdateExternalPausesRequest,
} from '@hashgraph/asset-tokenization-sdk';
import { useRolesStore } from '../../../../store/rolesStore';
import { hasRole } from '../../../../utils/helpers';
import { SecurityRole } from '../../../../utils/SecurityRole';

type ExternalPause = {
  id: string;
  isPaused: boolean;
};

export const ExternalPause = () => {
  const toast = useToast();
  const { id: securityId = '' } = useParams();

  const {
    isOpen: isOpenAddModal,
    onClose: onCloseAddModal,
    onOpen: onOpenAddModal,
  } = useDisclosure();
  const {
    isOpen: isOpenRemoveModal,
    onClose: onCloseRemoveModal,
    onOpen: onOpenRemoveModal,
  } = useDisclosure();
  const {
    isOpen: isOpenRemoveMultipleModal,
    onClose: onCloseRemoveMultipleModal,
    onOpen: onOpenRemoveMultipleModal,
  } = useDisclosure();

  const { roles } = useRolesStore();

  const hasPauseManagerRole = hasRole(roles, SecurityRole._PAUSE_MANAGER_ROLE);

  const { t: tList } = useTranslation('security', {
    keyPrefix: 'details.externalPause.list',
  });
  const { t: tTable } = useTranslation('security', {
    keyPrefix: 'details.externalPause.table',
  });
  const { t: tRemove } = useTranslation('security', {
    keyPrefix: 'details.externalPause.remove',
  });
  const { t: tMessage } = useTranslation('externalPause', {
    keyPrefix: 'list.messages',
  });

  const [externalPauseToRemove, setExternalPauseToRemove] =
    useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  const { data: externalPauses, isLoading } = useGetExternalPauses(securityId);
  const { mutateAsync, isLoading: isLoadingRemove } = useRemoveExternalPause();
  const {
    mutateAsync: updateExternalPauses,
    isLoading: isLoadingUpdateExternalPauses,
  } = useUpdateExternalPauses();

  const handleCheckboxChange = (id: string) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const newSelectedRows = externalPauses.reduce(
      (acc, item) => ({ ...acc, [item.id]: isChecked }),
      {},
    );
    setSelectedRows(newSelectedRows);
  };

  const columnsHelper = createColumnHelper<ExternalPause>();

  const columns = [
    ...(hasPauseManagerRole
      ? [
          columnsHelper.display({
            id: 'selection',
            header: () => {
              const totalRows = externalPauses.length;
              const selectedCount =
                Object.values(selectedRows).filter(Boolean).length;

              return (
                <Checkbox
                  isChecked={selectedCount === totalRows && totalRows > 0}
                  isIndeterminate={
                    selectedCount > 0 && selectedCount < totalRows
                  }
                  onChange={handleSelectAll}
                />
              );
            },
            enableSorting: false,
            size: 5,
            cell(props) {
              const {
                row: {
                  original: { id },
                },
              } = props;
              return (
                <Checkbox
                  isChecked={!!selectedRows[id]}
                  onChange={() => handleCheckboxChange(id)}
                />
              );
            },
          }),
        ]
      : []),
    columnsHelper.accessor('id', {
      header: tTable('fields.id'),
      enableSorting: false,
    }),
    columnsHelper.accessor('isPaused', {
      header: tTable('fields.state'),
      enableSorting: false,
      cell({ getValue }) {
        const isPaused = getValue();
        return (
          <Text>
            {isPaused
              ? tTable('fields.activated')
              : tTable('fields.deactivated')}
          </Text>
        );
      },
    }),
    columnsHelper.display({
      id: 'remove',
      header: tTable('fields.actions'),
      size: 5,
      enableSorting: false,
      cell(props) {
        const {
          row: {
            original: { id },
          },
        } = props;

        if (!hasPauseManagerRole) return;

        return (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setExternalPauseToRemove(id);
              onOpenRemoveModal();
            }}
            variant="table"
            size="xs"
          >
            <PhosphorIcon as={Trash} sx={{ color: 'secondary.500' }} />
          </Button>
        );
      },
    }),
  ];

  const disabledRemoveItems =
    Object.values(selectedRows).filter(Boolean).length <= 0;

  const handleMultipleRemove = () => {
    const pausedToDelete = Object.entries(selectedRows)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    if (pausedToDelete.length > 0) {
      updateExternalPauses(
        new UpdateExternalPausesRequest({
          securityId,
          externalPausesAddresses: pausedToDelete,
          actives: pausedToDelete.map(() => false),
        }),
      ).finally(() => {
        onCloseRemoveMultipleModal();
        toast.show({
          duration: 3000,
          title: tMessage('removeExternalPause.success'),
          description: tMessage('removeExternalPause.descriptionSuccess'),
          variant: 'subtle',
          status: 'success',
        });
      });
    }
  };

  const handleRemove = () => {
    mutateAsync(
      new RemoveExternalPauseRequest({
        securityId,
        externalPauseAddress: externalPauseToRemove,
      }),
    ).finally(() => {
      setExternalPauseToRemove('');
      onCloseRemoveModal();
    });
  };

  return (
    <>
      <Stack
        w="full"
        h="full"
        bg="neutral.50"
        borderRadius={1}
        p={4}
        pt={6}
        gap={4}
      >
        <HStack justifyContent={'space-between'}>
          <Text textStyle="ElementsSemiboldLG" color="neutral.light">
            {tList('title')}
          </Text>
          {hasPauseManagerRole && (
            <HStack>
              <Button
                onClick={() => {
                  onOpenRemoveMultipleModal();
                }}
                size="sm"
                variant={'secondary'}
                isDisabled={disabledRemoveItems}
              >
                {tList('removeItemsSelected')}
              </Button>
              <Button
                onClick={() => {
                  onOpenAddModal();
                }}
                size="sm"
              >
                {tList('add')}
              </Button>
            </HStack>
          )}
        </HStack>

        <Table
          name="external-pause-list"
          columns={columns}
          data={externalPauses ?? []}
          isLoading={isLoading}
          emptyComponent={<Text>{tTable('empty')}</Text>}
        />
      </Stack>
      <AddExternalPauseModal
        isOpen={isOpenAddModal}
        onClose={onCloseAddModal}
      />
      <PopUp
        id="removeExternalPause"
        isOpen={isOpenRemoveModal}
        onClose={() => {
          setExternalPauseToRemove('');
          onCloseRemoveModal();
        }}
        icon={<PhosphorIcon as={Trash} size="md" />}
        title={tRemove('title')}
        description={tRemove('description')}
        confirmText={tRemove('confirmText')}
        onConfirm={() => {
          handleRemove();
        }}
        onCancel={() => {
          setExternalPauseToRemove('');
          onCloseRemoveModal();
        }}
        cancelText={tRemove('cancelText')}
        confirmButtonProps={{
          isLoading: isLoadingRemove,
        }}
      />
      <PopUp
        id="removeExternalMultiplePause"
        isOpen={isOpenRemoveMultipleModal}
        onClose={onCloseRemoveMultipleModal}
        icon={<PhosphorIcon as={Trash} size="md" />}
        title={tRemove('title')}
        description={tRemove('description')}
        confirmText={tRemove('confirmText')}
        onConfirm={() => {
          handleMultipleRemove();
        }}
        onCancel={onCloseRemoveMultipleModal}
        cancelText={tRemove('cancelText')}
        confirmButtonProps={{
          isLoading: isLoadingUpdateExternalPauses,
        }}
      />
    </>
  );
};
