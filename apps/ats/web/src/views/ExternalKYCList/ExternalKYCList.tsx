import { Box, HStack, Stack, useDisclosure } from '@chakra-ui/react';
import { Header } from './Components/Header';
import {
  Button,
  PhosphorIcon,
  PopUp,
  Table,
  Text,
  useToast,
} from 'io-bricks-ui';
import { createColumnHelper } from '@tanstack/table-core';
import {
  MagnifyingGlass,
  Question,
  Trash,
  UserCircleMinus,
  UserCirclePlus,
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { useRolesStore } from '../../store/rolesStore';
import { User } from '../../utils/constants';
import { AddAddressModal } from './Components/AddAddressModal';
import { RemoveAddressModal } from './Components/RemoveAddressModal';
import { CheckAddressModal } from './Components/CheckAddressModal';
import { useExternalKYCStore } from '../../store/externalKYCStore';

export type ExternalKYC = {
  address: string;
};

export const ExternalKYCList = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    isOpen: isOpenCheckModal,
    onClose: onCloseCheckModal,
    onOpen: onOpenCheckModal,
  } = useDisclosure();

  const { t: tTable } = useTranslation('externalKYC', {
    keyPrefix: 'list.table',
  });
  const { t: tModal } = useTranslation('externalKYC', {
    keyPrefix: 'list.modal',
  });
  const { t: tMessages } = useTranslation('externalKYC', {
    keyPrefix: 'list.messages',
  });

  const [externalKYCSelected, setExternalKYCSelected] = useState<
    ExternalKYC | undefined
  >(undefined);

  const { externalKYCs, removeExternalKYC } = useExternalKYCStore();
  const { setType } = useUserStore();
  const { setRoles } = useRolesStore();

  useEffect(() => {
    setRoles([]);
    setType(User.general);
  }, [setRoles, setType]);

  const columnHelper = createColumnHelper<ExternalKYC>();

  const columns = [
    columnHelper.accessor('address', {
      header: tTable('address'),
      enableSorting: false,
      size: 700,
    }),
    columnHelper.display({
      header: tTable('actions'),
      enableSorting: false,
      cell(props) {
        const {
          row: { original },
        } = props;

        return (
          <HStack>
            <Button
              variant="table"
              size="xs"
              onClick={() => {
                setExternalKYCSelected(original);
                onOpenAddModal();
              }}
            >
              <PhosphorIcon
                as={UserCirclePlus}
                sx={{ color: 'secondary.500' }}
              />
            </Button>
            <Button
              variant="table"
              size="xs"
              onClick={() => {
                setExternalKYCSelected(original);
                onOpenRemoveModal();
              }}
            >
              <PhosphorIcon
                as={UserCircleMinus}
                sx={{ color: 'secondary.500' }}
              />
            </Button>
            <Button
              variant="table"
              size="xs"
              onClick={() => {
                setExternalKYCSelected(original);
                onOpenCheckModal();
              }}
            >
              <PhosphorIcon
                as={MagnifyingGlass}
                sx={{ color: 'secondary.500' }}
              />
            </Button>
            <Button variant="table" size="xs">
              <PhosphorIcon
                as={Trash}
                sx={{ color: 'secondary.500' }}
                onClick={() => {
                  setExternalKYCSelected(original);
                  onOpen();
                }}
              />
            </Button>
          </HStack>
        );
      },
    }),
  ];

  const handleDelete = () => {
    if (!externalKYCSelected) return;

    try {
      removeExternalKYC(externalKYCSelected.address);

      toast.show({
        status: 'success',
        title: tMessages('removeExternalKYC.success'),
        description: tMessages('removeExternalKYC.descriptionSuccess'),
      });
    } catch (_error) {
      toast.show({
        status: 'error',
        title: tMessages('removeExternalKYC.error'),
        description: tMessages('removeExternalKYC.descriptionFailed'),
      });
    }
  };

  return (
    <Stack gap={6}>
      <AddAddressModal
        isOpen={isOpenAddModal}
        onClose={onCloseAddModal}
        {...(externalKYCSelected !== undefined && {
          externalKYCSelected,
        })}
      />
      <RemoveAddressModal
        isOpen={isOpenRemoveModal}
        onClose={onCloseRemoveModal}
        {...(externalKYCSelected !== undefined && {
          externalKYCSelected,
        })}
      />
      <CheckAddressModal
        isOpen={isOpenCheckModal}
        onClose={onCloseCheckModal}
        {...(externalKYCSelected !== undefined && {
          externalKYCSelected,
        })}
      />
      <PopUp
        id="remove-external-KYC"
        isOpen={isOpen}
        onClose={onClose}
        icon={<PhosphorIcon as={Question} size="md" />}
        title={tModal('removeExternalKYCPopUp.title')}
        description={tModal('removeExternalKYCPopUp.description')}
        confirmText={tModal('removeExternalKYCPopUp.confirmText')}
        onConfirm={() => {
          handleDelete();
          onClose();
        }}
        onCancel={onClose}
        cancelText={tModal('removeExternalKYCPopUp.cancelText')}
      />

      <Header />
      <Box layerStyle={'container'}>
        <Table
          data={externalKYCs}
          columns={columns}
          name="externalKYCList"
          emptyComponent={<Text>{tTable('empty')}</Text>}
        />
      </Box>
    </Stack>
  );
};
