import React from 'react';
import { Box } from '@chakra-ui/react';
import { Text } from 'io-bricks-ui';
import { TFunction } from 'i18next';

export const EmptyDistributionsState: React.FC<{ t: TFunction }> = ({ t }) => (
  <Box
    display='flex'
    alignItems='center'
    justifyContent='center'
    flex='1'
    minHeight='200px'
  >
    <Text textStyle='ElementsRegularMD' color='neutral.500' textAlign='center'>
      {t('assets:noDistributionsYet')}
    </Text>
  </Box>
);
