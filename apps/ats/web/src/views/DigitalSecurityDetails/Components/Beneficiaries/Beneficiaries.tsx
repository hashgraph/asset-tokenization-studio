import { Flex, HStack, Stack, useDisclosure } from '@chakra-ui/react';
import { Button, PhosphorIcon, PopUp, Table, Text } from 'io-bricks-ui';
import { useMemo, useState } from 'react';
import { SecurityRole } from '../../../../utils/SecurityRole';
import { useRolesStore } from '../../../../store/rolesStore';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/table-core';
import { Pencil, Trash } from '@phosphor-icons/react';
import { AddBeneficiaryModal } from './AddBeneficiaryModal';
import {
  GetBeneficiariesCountRequest,
  RemoveBeneficiaryRequest,
} from '@hashgraph/asset-tokenization-sdk';
import {
  BeneficiaryDataViewModelResponse,
  useGetBeneficiaryList,
} from '../../../../hooks/queries/useBeneficiaries';
import { UpdateBeneficiaryModal } from './UpdateBeneficiaryModal';
import { useRemoveBeneficiary } from '../../../../hooks/mutations/useBeneficiaries';

export const Beneficiaries = () => {
  const { id: securityId = '' } = useParams();

  const { roles: accountRoles } = useRolesStore();

  const { t: tBeneficiaries } = useTranslation('security', {
    keyPrefix: 'details.beneficiaries',
  });
  const { t: tTable } = useTranslation('security', {
    keyPrefix: 'details.beneficiaries.table',
  });
  const { t: tRemove } = useTranslation('security', {
    keyPrefix: 'details.beneficiaries.remove',
  });

  const [beneficiaryIdSelected, setBeneficiaryIdSelected] = useState('');

  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    isOpen: isOpenUpdate,
    onClose: onCloseUpdate,
    onOpen: onOpenUpdate,
  } = useDisclosure();
  const {
    isOpen: isOpenRemoveBeneficiaryModal,
    onClose: onCloseRemoveBeneficiaryModal,
    onOpen: onOpenRemoveBeneficiaryModal,
  } = useDisclosure();

  const hasBeneficiaryManagerRole = useMemo(
    () =>
      accountRoles.findIndex(
        (rol) => rol === SecurityRole._BENEFICIARY_MANAGER_ROLE,
      ) !== -1,
    [accountRoles],
  );

  const { data: beneficiaries, isLoading: isLoadingBeneficiaries } =
    useGetBeneficiaryList(
      new GetBeneficiariesCountRequest({
        securityId,
      }),
    );

  const {
    mutate: removeBeneficiaryMutation,
    isPending: isPendingRemoveBeneficiary,
  } = useRemoveBeneficiary();

  const columnsHelper = createColumnHelper<BeneficiaryDataViewModelResponse>();

  const columns = [
    columnsHelper.accessor('address', {
      header: tTable('fields.address'),
      enableSorting: false,
    }),
    columnsHelper.accessor('data', {
      header: tTable('fields.data'),
      enableSorting: false,
    }),
    ...(hasBeneficiaryManagerRole
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
                      setBeneficiaryIdSelected(address);
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
                      setBeneficiaryIdSelected(address);
                      onOpenRemoveBeneficiaryModal();
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
            {tBeneficiaries('title')}
          </Text>
          {hasBeneficiaryManagerRole && (
            <Button
              onClick={() => {
                onOpen();
              }}
              size="sm"
            >
              {tBeneficiaries('add')}
            </Button>
          )}
        </HStack>
        <Table
          name="beneficiaries-list"
          columns={columns}
          data={beneficiaries ?? []}
          isLoading={isLoadingBeneficiaries}
          emptyComponent={
            <Flex>
              <Text textStyle="ElementsSemiboldMD">No beneficiaries</Text>
            </Flex>
          }
        />
      </Stack>
      <AddBeneficiaryModal isOpen={isOpen} onClose={onClose} />
      <UpdateBeneficiaryModal
        isOpen={isOpenUpdate}
        onClose={onCloseUpdate}
        beneficiaryId={beneficiaryIdSelected}
      />
      <PopUp
        id="removeBeneficiaryModal"
        isOpen={isOpenRemoveBeneficiaryModal}
        onClose={onCloseRemoveBeneficiaryModal}
        icon={<PhosphorIcon as={Trash} size="md" />}
        title={tRemove('confirmPopUp.title')}
        description={tRemove('confirmPopUp.description')}
        confirmText={tRemove('confirmPopUp.confirmText')}
        onConfirm={() => {
          const request = new RemoveBeneficiaryRequest({
            securityId,
            beneficiaryId: beneficiaryIdSelected,
          });

          removeBeneficiaryMutation(request, {
            onSuccess() {
              onCloseRemoveBeneficiaryModal();
            },
          });
        }}
        onCancel={onCloseRemoveBeneficiaryModal}
        cancelText={tRemove('confirmPopUp.cancelText')}
        confirmButtonProps={{
          isLoading: isPendingRemoveBeneficiary,
        }}
      />
    </>
  );
};
