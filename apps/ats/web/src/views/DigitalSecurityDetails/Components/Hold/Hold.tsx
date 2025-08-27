import { Stack } from '@chakra-ui/react';
import { HoldList } from './HoldList';
import { HoldCreate } from './HoldCreate';
import { useTranslation } from 'react-i18next';
import { HoldManage } from './HoldManage';
import { PanelTabs } from '../../../../components/PanelTabs/PanelTabs';

export const Hold = () => {
  const { t: tTabs } = useTranslation('security', {
    keyPrefix: 'details.hold.tabs',
  });

  return (
    <Stack w="full" h="full" layerStyle="container">
      <PanelTabs
        tabs={[
          {
            content: <HoldList />,
            header: tTabs('list'),
          },
          { content: <HoldCreate />, header: tTabs('create') },
          { content: <HoldManage />, header: tTabs('manage') },
        ]}
        isFitted
      />
    </Stack>
  );
};
