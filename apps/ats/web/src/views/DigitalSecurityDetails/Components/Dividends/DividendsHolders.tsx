import { Flex, HStack } from '@chakra-ui/react';
import { Button, InputController, Table, Text } from 'io-bricks-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { required } from '../../../../utils/rules';
import { createColumnHelper } from '@tanstack/table-core';
import { useGetDividendHolders } from '../../../../hooks/queries/useDividends';
import { useParams } from 'react-router-dom';
import { GetDividendHoldersRequest } from '@hashgraph/asset-tokenization-sdk';

type DividendsHoldersData = {
  holderAddress: string;
};

export const DividendsHolders = () => {
  const { id: securityId = '' } = useParams();
  const { t } = useTranslation('security', {
    keyPrefix: 'details.dividends.holders',
  });

  const {
    control,
    watch,
    formState: { isValid },
    handleSubmit,
  } = useForm({
    mode: 'onSubmit',
  });

  const dividendId = watch('dividendId');

  const { data, refetch, isFetching } = useGetDividendHolders<
    unknown,
    DividendsHoldersData[]
  >(
    new GetDividendHoldersRequest({
      securityId: securityId,
      dividendId: Number(dividendId),
      start: 0,
      end: 100,
    }),
    {
      enabled: false,
      staleTime: 0,
      cacheTime: 0,
      select: (data) => {
        return (
          data?.map((item) => ({
            holderAddress: item,
          })) || []
        );
      },
    },
  );

  const columnHelper = createColumnHelper<DividendsHoldersData>();

  const columns = [
    columnHelper.accessor('holderAddress', {
      header: t('table.holderAddress'),
      enableSorting: false,
    }),
  ];

  const onSubmit = () => {
    refetch();
  };

  return (
    <Flex flexDir={'column'} gap={4}>
      <HStack
        gap={4}
        justifyContent={'flex-end'}
        alignItems={'flex-end'}
        w={'400px'}
      >
        <InputController
          label={t('dividendIdInput.label')}
          control={control}
          id="dividendId"
          rules={{
            required,
          }}
          placeholder={t('dividendIdInput.placeholder')}
          showErrors={false}
        />
        <Button
          variant={'primary'}
          onClick={handleSubmit(onSubmit)}
          isDisabled={!isValid || isFetching}
          isLoading={isFetching}
          size={'md'}
          width={'150px'}
        >
          {t('searchButton')}
        </Button>
      </HStack>
      <Table
        columns={columns}
        data={data ?? []}
        name={'dividends-holders'}
        emptyComponent={<Text>{t('emptyTable')}</Text>}
        isLoading={isFetching}
      />
    </Flex>
  );
};
