import { Flex, HStack, Stack, useDisclosure } from '@chakra-ui/react';
import { Button, PhosphorIcon, PopUp, Table, Text } from 'io-bricks-ui';
import { useMemo, useState } from 'react';
import { SecurityRole } from '../../../../utils/SecurityRole';
import { useRolesStore } from '../../../../store/rolesStore';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/table-core';
import { Pencil, Trash } from '@phosphor-icons/react';
import { AddProceedRecipientModal } from './AddProceedRecipientModal';
import {
  GetProceedRecipientsCountRequest,
  RemoveProceedRecipientRequest,
} from '@hashgraph/asset-tokenization-sdk';
import {
  ProceedRecipientDataViewModelResponse,
  useGetProceedRecipientList,
} from '../../../../hooks/queries/useProceedRecipients';
import { UpdateProceedRecipientModal } from './UpdateProceedRecipientModal';
import { useRemoveProceedRecipient } from '../../../../hooks/mutations/useProceedRecipients';
import { hexToText } from '../../../../utils/format';

export const ProceedRecipients = () => {
  const { id: securityId = '' } = useParams();

  const { roles: accountRoles } = useRolesStore();

  const { t: tProceedRecipients } = useTranslation('security', {
    keyPrefix: 'details.proceedRecipients',
  });
  const { t: tTable } = useTranslation('security', {
    keyPrefix: 'details.proceedRecipients.table',
  });
  const { t: tRemove } = useTranslation('security', {
    keyPrefix: 'details.proceedRecipients.remove',
  });

  const [proceedRecipientIdSelected, setProceedRecipientIdSelected] =
    useState('');

  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    isOpen: isOpenUpdate,
    onClose: onCloseUpdate,
    onOpen: onOpenUpdate,
  } = useDisclosure();
  const {
    isOpen: isOpenRemoveProceedRecipientModal,
    onClose: onCloseRemoveProceedRecipientModal,
    onOpen: onOpenRemoveProceedRecipientModal,
  } = useDisclosure();

  const hasProceedRecipientManagerRole = useMemo(
    () =>
      accountRoles.findIndex(
        (rol) => rol === SecurityRole._PROCEED_RECIPIENT_MANAGER_ROLE,
      ) !== -1,
    [accountRoles],
  );

  const { data: proceedRecipients, isLoading: isLoadingProceedRecipients } =
    useGetProceedRecipientList(
      new GetProceedRecipientsCountRequest({
        securityId,
      }),
    );

  const {
    mutate: removeProceedRecipientMutation,
    isPending: isPendingRemoveProceedRecipient,
  } = useRemoveProceedRecipient();

  const columnsHelper =
    createColumnHelper<ProceedRecipientDataViewModelResponse>();

  const columns = [
    columnsHelper.accessor('address', {
      header: tTable('fields.address'),
      enableSorting: false,
    }),
    columnsHelper.accessor('data', {
      header: tTable('fields.data'),
      enableSorting: false,
      cell({
        row: {
          original: { data },
        },
      }) {
        return data ? hexToText(data) : '-';
      },
    }),
    ...(hasProceedRecipientManagerRole
      ? [
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

              return (
                <HStack gap={2}>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProceedRecipientIdSelected(address);
                      onOpenUpdate();
                    }}
                    variant="table"
                    size="xs"
                  >
                    <PhosphorIcon as={Pencil} sx={{ color: 'secondary.500' }} />
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProceedRecipientIdSelected(address);
                      onOpenRemoveProceedRecipientModal();
                    }}
                    variant="table"
                    size="xs"
                  >
                    <PhosphorIcon as={Trash} sx={{ color: 'secondary.500' }} />
                  </Button>
                </HStack>
              );
            },
          }),
        ]
      : []),
  ];

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
            {tProceedRecipients('title')}
          </Text>
          {hasProceedRecipientManagerRole && (
            <Button
              onClick={() => {
                onOpen();
              }}
              size="sm"
            >
              {tProceedRecipients('add')}
            </Button>
          )}
        </HStack>
        <Table
          name="proceedRecipients-list"
          columns={columns}
          data={proceedRecipients ?? []}
          isLoading={isLoadingProceedRecipients}
          emptyComponent={
            <Flex>
              <Text textStyle="ElementsSemiboldMD">No proceed recipients</Text>
            </Flex>
          }
        />
      </Stack>
      <AddProceedRecipientModal isOpen={isOpen} onClose={onClose} />
      <UpdateProceedRecipientModal
        isOpen={isOpenUpdate}
        onClose={onCloseUpdate}
        proceedRecipientId={proceedRecipientIdSelected}
      />
      <PopUp
        id="removeProceedRecipientModal"
        isOpen={isOpenRemoveProceedRecipientModal}
        onClose={onCloseRemoveProceedRecipientModal}
        icon={<PhosphorIcon as={Trash} size="md" />}
        title={tRemove('confirmPopUp.title')}
        description={tRemove('confirmPopUp.description')}
        confirmText={tRemove('confirmPopUp.confirmText')}
        onConfirm={() => {
          const request = new RemoveProceedRecipientRequest({
            securityId,
            proceedRecipientId: proceedRecipientIdSelected,
          });

          removeProceedRecipientMutation(request, {
            onSuccess() {
              onCloseRemoveProceedRecipientModal();
            },
          });
        }}
        onCancel={onCloseRemoveProceedRecipientModal}
        cancelText={tRemove('confirmPopUp.cancelText')}
        confirmButtonProps={{
          isLoading: isPendingRemoveProceedRecipient,
        }}
      />
    </>
  );
};
