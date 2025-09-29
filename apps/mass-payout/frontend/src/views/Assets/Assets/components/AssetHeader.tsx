/*
 * Copyright (c) 2024 IOB - Todos los derechos reservados.
 * Este archivo es parte del software propietario de IOB.
 * Queda prohibida su distribución, copia o uso no autorizado.
 */

import { Stack } from '@chakra-ui/react';
import { Button, Text, Tooltip } from 'io-bricks-ui';
import { useTranslation } from 'react-i18next';
import { RouteName } from '@/router/RouteName';
import { RouterManager } from '@/router/RouterManager';

export const AssetHeader = () => {
  const { t } = useTranslation('assets');

  const handleNewAsset = () => {
    RouterManager.to(RouteName.ImportAsset);
  };

  return (
    <Stack direction="row" justify="space-between" align="center" mb={4}>
      <Text textStyle="HeadingBoldXL" color="neutral.800" ml={4}>
        {t('title')}
      </Text>
      <Tooltip
        data-testid="tooltip-assetheader"
        label={t('tooltipText')}
        placement="bottom-end"
        bg="neutral.900"
        color="white"
        textStyle="ElementsRegularSM"
      >
        <Button colorScheme="blue" size="md" onClick={handleNewAsset}>
          {t('importAsset')}
        </Button>
      </Tooltip>
    </Stack>
  );
};
