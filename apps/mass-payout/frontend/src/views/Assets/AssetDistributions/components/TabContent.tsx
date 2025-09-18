import React from 'react';
import { Box } from '@chakra-ui/react';
import { Table, Text } from 'io-bricks-ui';
import { RoutePath } from '@/router/RoutePath';
import {
  TabContentProps,
  AssetDistributionData,
} from '../AssetDistributions.types';
import { getTabTitle } from '../AssetDistributions.constants';
import {
  isDistributionRowClickable,
  calculateTotalPages,
} from '../AssetDistributions.utils';
import { FilterControls } from './FilterControls';
import { EmptyDistributionsState } from './EmptyDistributionsState';

export const TabContent: React.FC<TabContentProps> = ({
  filterType,
  columns,
  filteredDistributions,
  totalFilteredElements,
  isLoading,
  control,
  id,
  navigate,
  table,
  t,
}) => {
  const handleRowClick = (row: AssetDistributionData) => {
    if (isDistributionRowClickable(row.status) && id) {
      const url = RoutePath.DISTRIBUTIONS_DETAILS.replace(':id', id)
        .replace(':type', 'distribution')
        .replace(':itemId', row.id);
      navigate(url);
    }
  };

  return (
    <Box flex='1' display='flex' flexDirection='column' minHeight='0'>
      <Text textStyle='ElementsSemiboldLG' color='neutral.900' mb={6} mt={3}>
        {getTabTitle(filterType)}
      </Text>

      <FilterControls control={control} t={t} />

      <Box flex='1' display='flex' flexDirection='column' minHeight='0'>
        {!isLoading && filteredDistributions.length === 0 ? (
          <EmptyDistributionsState t={t} />
        ) : (
          <Table
            name={`asset-distributions-${filterType}`}
            columns={columns}
            data={filteredDistributions}
            onClickRow={handleRowClick}
            totalElements={totalFilteredElements}
            totalPages={calculateTotalPages(
              totalFilteredElements,
              table.pagination.pageSize
            )}
            isLoading={isLoading}
            {...table}
          />
        )}
      </Box>
    </Box>
  );
};
