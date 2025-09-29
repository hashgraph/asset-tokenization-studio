import React from 'react';
import { Box, Stack } from '@chakra-ui/react';
import { SearchInputController, SelectController } from 'io-bricks-ui';
import { Control } from 'react-hook-form';
import { TFunction } from 'i18next';
import { DISTRIBUTION_TYPE_OPTIONS } from '../AssetDistributions.constants';
import { PlaceholderWithIcon } from '../../Components/PlaceholderWithIcon';
import { AssetDistributionsFormValues } from '../AssetDistributions.types';

export const FilterControls: React.FC<{
  control: Control<AssetDistributionsFormValues>;
  t: TFunction;
}> = ({ control, t }) => (
  <Stack direction="row" mb={6} alignItems="center" gap={4}>
    <Box w="full" maxW="280px">
      <SelectController
        control={control}
        id="distributionType"
        placeholder={<PlaceholderWithIcon />}
        options={DISTRIBUTION_TYPE_OPTIONS}
        isSearchable={false}
      />
    </Box>
    <Box w="full" maxW="280px">
      <SearchInputController
        id="search"
        placeholder={t('filters.searchPlaceholder')}
        control={control}
        onSearch={() => {}}
      />
    </Box>
  </Stack>
);
