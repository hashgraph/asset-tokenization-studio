import { Box, HStack, Stack, useDisclosure } from '@chakra-ui/react';
import { History } from '../../components/History';
import { RouteName } from '../../router/RouteName';
import { RoutePath } from '../../router/RoutePath';
import {
  Button,
  ClipboardButton,
  PhosphorIcon,
  PopUp,
  SearchInputController,
  Table,
  Text,
} from 'io-bricks-ui';
import { isHederaValidAddress, required } from '../../utils/rules';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { CellContext, createColumnHelper } from '@tanstack/table-core';
import { Trash } from '@phosphor-icons/react';
import { useState } from 'react';

interface FieldsTable {
  address: string;
}

export const ExternalControlDetails = () => {
  const { t: tRoutes } = useTranslation('routes');
  const { t } = useTranslation('externalControlDetails');

  const { isOpen, onClose, onOpen } = useDisclosure();

  const [_accountToRemove, setAccountToRemove] = useState<string>('');

  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm({
    mode: 'onChange',
  });

  const columnsHelper = createColumnHelper<FieldsTable>();
  const columns = [
    columnsHelper.accessor('address', {
      header: t('table.address'),
      enableSorting: false,
      size: 995,
      cell: ({ getValue }) => {
        const address: string = getValue();

        return (
          <HStack gap={1.5}>
            <Text>{address}</Text>
            <ClipboardButton sx={{ color: 'secondary.500' }} value={address} />
          </HStack>
        );
      },
    }),
    columnsHelper.display({
      id: 'remove',
      header: t('table.actions'),
      size: 5,
      enableSorting: false,
      cell: (props) => renderRemove(props),
    }),
  ];

  const renderRemove = (
    props: CellContext<FieldsTable, unknown | undefined>,
  ) => {
    const {
      row: {
        original: { address },
      },
    } = props;

    return (
      <Button
        variant="table"
        onClick={(e) => {
          e.stopPropagation();
          setAccountToRemove(address);
          onOpen();
        }}
        size="xs"
      >
        <PhosphorIcon as={Trash} sx={{ color: 'secondary.500' }} />
      </Button>
    );
  };

  const onSubmit = () => {};

  return (
    <Stack gap={6} flex={1}>
      <History
        label={tRoutes(RouteName.ExternalControlDetails)}
        excludePaths={[RoutePath.DASHBOARD]}
      />
      <Box
        layerStyle={'container'}
        w={'full'}
        h={'full'}
        flex={1}
        alignItems={'center'}
      >
        <HStack
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          gap={4}
          alignItems="flex-start"
          mb={4}
        >
          <Stack w="280px">
            <SearchInputController
              id="search"
              placeholder={t('search.placeholder')}
              onSearch={(search) => console.log('SEARCHING: ', search)}
              control={control}
              size="sm"
              rules={{
                required,
                validate: { isHederaValidAddress },
              }}
            />
          </Stack>
          <Button size="sm" isDisabled={!isValid} type="submit">
            {t('search.add')}
          </Button>
        </HStack>

        <Table
          name="external-control-address"
          columns={columns}
          data={[]}
          emptyComponent={<Text>{t('table.empty')}</Text>}
        />
      </Box>
      <PopUp
        id="removeAddress"
        isOpen={isOpen}
        onClose={onClose}
        icon={<PhosphorIcon as={Trash} size="md" />}
        title={t('modal.removeAddress.title')}
        description={t('modal.removeAddress.description')}
        confirmText={t('modal.removeAddress.confirmText')}
        onConfirm={() => {
          onClose();
        }}
        onCancel={onClose}
        cancelText={t('modal.removeAddress.cancelText')}
      />
    </Stack>
  );
};
