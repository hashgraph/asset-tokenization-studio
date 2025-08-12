import {
  Box,
  HStack,
  Menu,
  MenuButton,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';
import { Header } from './Components/Header';
import {
  Button,
  Dropdown,
  DropdownItem,
  PhosphorIcon,
  PopUp,
  Spinner,
  Table,
  Text,
  useToast,
} from 'io-bricks-ui';
import { createColumnHelper } from '@tanstack/table-core';
import { DotsThreeVertical, Question, Trash } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useExternalPauseStore } from '../../store/externalPauseStore';
import { useUserStore } from '../../store/userStore';
import { useRolesStore } from '../../store/rolesStore';
import { User } from '../../utils/constants';
import { useSetPausedMock } from '../../hooks/mutations/useExternalPause';
import { SetPausedMockRequest } from '@hashgraph/asset-tokenization-sdk';

type ExternalPause = {
  address: string;
  isPaused: boolean;
};

export const ExternalPauseList = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t: tTable } = useTranslation('externalPause', {
    keyPrefix: 'list.table',
  });
  const { t: tModal } = useTranslation('externalPause', {
    keyPrefix: 'list.modal',
  });
  const { t: tMessages } = useTranslation('externalPause', {
    keyPrefix: 'list.messages',
  });

  const [loadingRow, setLoadingRow] = useState<string | null>(null);
  const [externalPauseSelected, setExternalPauseSelected] = useState<
    string | undefined
  >(undefined);

  const { externalPauses, removeExternalPause, toggleExternalPause } =
    useExternalPauseStore();
  const { setType } = useUserStore();
  const { setRoles } = useRolesStore();

  const { mutateAsync, isLoading } = useSetPausedMock();

  useEffect(() => {
    setRoles([]);
    setType(User.general);
  }, [setRoles, setType]);

  const columnHelper = createColumnHelper<ExternalPause>();

  const columns = [
    columnHelper.accessor('address', {
      header: tTable('address'),
      enableSorting: false,
    }),
    columnHelper.accessor('isPaused', {
      header: tTable('state'),
      enableSorting: false,
      cell({ getValue }) {
        const value = getValue();
        return (
          <Text _firstLetter={{ textTransform: 'uppercase' }}>
            {value ? tTable('activated') : tTable('deactivated')}
          </Text>
        );
      },
    }),
    columnHelper.display({
      header: tTable('actions'),
      maxSize: 1,
      minSize: 1,
      enableSorting: false,
      cell(props) {
        const {
          row: {
            original: { address, isPaused },
          },
        } = props;

        return (
          <HStack>
            <Menu>
              <MenuButton as={Button} size="xs" variant={'outline'}>
                {isLoading && loadingRow === address ? (
                  <Spinner color="secondary.500" />
                ) : (
                  <PhosphorIcon as={DotsThreeVertical} />
                )}
              </MenuButton>
              <Dropdown w="180px">
                <DropdownItem
                  label={isPaused ? tTable('deactivated') : tTable('activated')}
                  onClick={() => {
                    handleState(address, !isPaused);
                  }}
                />
              </Dropdown>
            </Menu>
            <Button variant="table" size="xs">
              <PhosphorIcon
                as={Trash}
                sx={{ color: 'secondary.500' }}
                onClick={() => {
                  setExternalPauseSelected(address);
                  onOpen();
                }}
              />
            </Button>
          </HStack>
        );
      },
    }),
  ];

  const handleState = async (id: string, isPaused: boolean) => {
    setLoadingRow(id);

    try {
      await mutateAsync(
        new SetPausedMockRequest({
          contractId: id,
          paused: isPaused,
        }),
      );

      toggleExternalPause(id, isPaused);
    } finally {
      setLoadingRow(null);
    }
  };

  const handleDelete = () => {
    if (!externalPauseSelected) return;

    try {
      removeExternalPause(externalPauseSelected);

      toast.show({
        status: 'success',
        title: tMessages('removeExternalPause.success'),
        description: tMessages('removeExternalPause.descriptionSuccess'),
      });
    } catch (error) {
      toast.show({
        status: 'error',
        title: tMessages('removeExternalPause.error'),
        description: tMessages('removeExternalPause.descriptionFailed'),
      });
    }
  };

  return (
    <Stack gap={6}>
      <PopUp
        id="remove-external-pause"
        isOpen={isOpen}
        onClose={onClose}
        icon={<PhosphorIcon as={Question} size="md" />}
        title={tModal('removeExternalPausePopUp.title')}
        description={tModal('removeExternalPausePopUp.description')}
        confirmText={tModal('removeExternalPausePopUp.confirmText')}
        onConfirm={() => {
          handleDelete();
          onClose();
        }}
        onCancel={onClose}
        cancelText={tModal('removeExternalPausePopUp.cancelText')}
      />

      <Header />
      <Box layerStyle={'container'}>
        <Table
          data={externalPauses}
          columns={columns}
          name="externalPauseList"
          emptyComponent={<Text>{tTable('empty')}</Text>}
        />
      </Box>
    </Stack>
  );
};
