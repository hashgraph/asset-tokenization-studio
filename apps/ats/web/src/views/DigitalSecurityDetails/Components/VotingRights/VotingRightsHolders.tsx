import { Flex, HStack } from '@chakra-ui/react';
import { Button, InputController, Table, Text } from 'io-bricks-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { required } from '../../../../utils/rules';
import { createColumnHelper } from '@tanstack/table-core';
import { useParams } from 'react-router-dom';
import { useGetVotingHolders } from '../../../../hooks/queries/VotingRights';
import { GetVotingHoldersRequest } from '@hashgraph/asset-tokenization-sdk';

type VotingRightsHoldersData = {
  holderAddress: string;
};

export const VotingRightsHolders = () => {
  const { id: securityId = '' } = useParams();
  const { t } = useTranslation('security', {
    keyPrefix: 'details.votingRights.holders',
  });

  const {
    control,
    watch,
    formState: { isValid },
    handleSubmit,
  } = useForm({
    mode: 'onSubmit',
  });

  const voteId = watch('voteId');

  const { data, refetch, isFetching } = useGetVotingHolders<
    unknown,
    VotingRightsHoldersData[]
  >(
    new GetVotingHoldersRequest({
      securityId: securityId,
      voteId: Number(voteId),
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

  const columnHelper = createColumnHelper<VotingRightsHoldersData>();

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
          label={t('voteIdInput.label')}
          control={control}
          id="voteId"
          rules={{
            required,
          }}
          placeholder={t('voteIdInput.placeholder')}
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
        name="voting-rights-holders"
        emptyComponent={<Text>{t('emptyTable')}</Text>}
        isLoading={isFetching}
      />
    </Flex>
  );
};
