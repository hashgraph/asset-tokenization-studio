/*
 * Copyright (c) 2024 IOB - Todos los derechos reservados.
 * Este archivo es parte del software propietario de IOB.
 * Queda prohibida su distribución, copia o uso no autorizado.
 */

import { Box, Stack } from '@chakra-ui/react';
import { Breadcrumb, Text } from 'io-bricks-ui';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  link: {
    as: typeof RouterLink;
    to: string;
  };
  isActive?: boolean;
}

interface ImportHeaderProps {
  breadcrumbs: BreadcrumbItem[];
}

export const ImportHeader = ({ breadcrumbs }: ImportHeaderProps) => {
  const { t } = useTranslation('assets');

  return (
    <Box>
      <Stack spacing={4}>
        <Breadcrumb items={breadcrumbs} />
        <Text fontSize="2xl" fontWeight="bold">
          {t('importAsset')}
        </Text>
      </Stack>
    </Box>
  );
};
