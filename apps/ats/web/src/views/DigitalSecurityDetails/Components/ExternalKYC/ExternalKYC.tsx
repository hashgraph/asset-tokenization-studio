import React from 'react';
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
import { Trash } from '@phosphor-icons/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRolesStore } from '../../../../store/rolesStore';
import { hasRole } from '../../../../utils/helpers';
import { SecurityRole } from '../../../../utils/SecurityRole';
import { AddExternalKYCModal } from './AddExternalKYCModal';
import { useGetExternalKyc } from '../../../../hooks/queries/useExternalKYC';
import {
  useRemoveExternalKYCList,
  useUpdateExternalKYCLists,
} from '../../../../hooks/mutations/useExternalKYC';
import {
  RemoveExternalKycListRequest,
  UpdateExternalKycListsRequest,
} from '@hashgraph/asset-tokenization-sdk';

type ExternalKYCType = {
  address: string;
};

export const ExternalKYC = () => {
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

  const hasKYCManagerRole = hasRole(roles, SecurityRole._KYC_MANAGER_ROLE);

  const { t: tList } = useTranslation('security', {
    keyPrefix: 'details.externalKYC.list',
  });
  const { t: tTable } = useTranslation('security', {
    keyPrefix: 'details.externalKYC.table',
  });
  const { t: tRemove } = useTranslation('security', {
    keyPrefix: 'details.externalKYC.remove',
  });
  const { t: tMessage } = useTranslation('externalKYC', {
    keyPrefix: 'list.messages',
  });

  const [externalKYCToRemove, setExternalKYCToRemove] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  const { data: externalKYCs, isLoading } = useGetExternalKyc(securityId);
  const { mutateAsync, isLoading: isLoadingRemove } =
    useRemoveExternalKYCList();
  const {
    mutateAsync: updateExternalKYCs,
    isLoading: isLoadingUpdateExternalKYCs,
  } = useUpdateExternalKYCLists();

  const handleCheckboxChange = (id: string) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const newSelectedRows = externalKYCs.reduce(
      (acc, item) => ({ ...acc, [item.address]: isChecked }),
      {},
    );
    setSelectedRows(newSelectedRows);
  };

  const columnsHelper = createColumnHelper<ExternalKYCType>();

  const columns = [
    ...(hasKYCManagerRole
      ? [
          columnsHelper.display({
            id: 'selection',
            header: () => {
              const totalRows = externalKYCs.length;
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
                  original: { address },
                },
              } = props;
              return (
                <Checkbox
                  isChecked={!!selectedRows[address]}
                  onChange={() => handleCheckboxChange(address)}
                />
              );
            },
          }),
        ]
      : []),
    columnsHelper.accessor('address', {
      header: tTable('fields.id'),
      enableSorting: false,
    }),
    columnsHelper.display({
      id: 'remove',
      header: tTable('fields.actions'),
      size: 5,
      enableSorting: false,
      cell(props) {
        const {
          row: {
            original: { address },
          },
        } = props;

        if (!hasKYCManagerRole) return;

        return (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setExternalKYCToRemove(address);
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
    const KYCdToDelete = Object.entries(selectedRows)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    if (KYCdToDelete.length > 0) {
      updateExternalKYCs(
        new UpdateExternalKycListsRequest({
          securityId,
          externalKycListsAddresses: KYCdToDelete,
          actives: KYCdToDelete.map(() => false),
        }),
      ).finally(() => {
        onCloseRemoveMultipleModal();
        toast.show({
          duration: 3000,
          title: tMessage('removeExternalKYC.success'),
          description: tMessage('removeExternalKYC.descriptionSuccess'),
          variant: 'subtle',
          status: 'success',
        });
      });
    }
  };

  const handleRemove = () => {
    mutateAsync(
      new RemoveExternalKycListRequest({
        securityId,
        externalKycListAddress: externalKYCToRemove,
      }),
    ).finally(() => {
      setExternalKYCToRemove('');
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
          {hasKYCManagerRole && (
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
          name="external-KYC-list"
          columns={columns}
          data={externalKYCs ?? []}
          isLoading={isLoading}
          emptyComponent={<Text>{tTable('empty')}</Text>}
        />
      </Stack>
      <AddExternalKYCModal isOpen={isOpenAddModal} onClose={onCloseAddModal} />
      <PopUp
        id="removeExternalKYC"
        isOpen={isOpenRemoveModal}
        onClose={() => {
          setExternalKYCToRemove('');
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
          setExternalKYCToRemove('');
          onCloseRemoveModal();
        }}
        cancelText={tRemove('cancelText')}
        confirmButtonProps={{
          isLoading: isLoadingRemove,
        }}
      />
      <PopUp
        id="removeExternalMultipleKYC"
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
          isLoading: isLoadingUpdateExternalKYCs,
        }}
      />
    </>
  );
};
