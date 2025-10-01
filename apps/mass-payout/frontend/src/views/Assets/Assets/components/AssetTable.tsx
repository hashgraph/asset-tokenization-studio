/*
 * Copyright (c) 2024 IOB - Todos los derechos reservados.
 * Este archivo es parte del software propietario de IOB.
 * Queda prohibida su distribución, copia o uso no autorizado.
 */

import { Box, Text } from '@chakra-ui/react';
import { Table } from 'io-bricks-ui';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import { UseTableReturn } from '@/hooks/useTable';
import { RouteName } from '@/router/RouteName';
import { RouterManager } from '@/router/RouterManager';
import type { Asset } from '@/services/AssetService';

interface AssetTableProps {
  isLoading: boolean;
  columns: ColumnDef<Asset>[];
  filteredAssets: Asset[];
  totalPages: number;
  table: UseTableReturn;
}

export const AssetTable = ({
  isLoading,
  columns,
  filteredAssets,
  totalPages,
  table,
}: AssetTableProps) => {
  const { t } = useTranslation('assets');

  const onClickRow = (asset: Asset) => {
    RouterManager.to(RouteName.AssetDetail, {
      params: { id: asset.id },
    });
  };

  return (
    <Box
      bg="neutral.50"
      borderRadius="lg"
      boxShadow="sm"
      p={6}
      flex="1"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Text textStyle="ElementsSemiboldLG" color="neutral.900" mb={6}>
        {t('title')}
      </Text>

      <Box flex="1" display="flex" flexDirection="column" minHeight="0">
        <Table
          isLoading={isLoading}
          name="assets"
          columns={columns}
          data={filteredAssets}
          onClickRow={onClickRow}
          totalElements={filteredAssets.length}
          totalPages={totalPages}
          {...table}
        />
      </Box>
    </Box>
  );
};
