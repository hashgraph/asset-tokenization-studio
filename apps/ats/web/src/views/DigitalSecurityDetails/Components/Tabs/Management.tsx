import { Box } from '@chakra-ui/react';
import { Tabs } from 'io-bricks-ui';
import { RoleManagement } from '../RoleManagement/RoleManagement';
import { useTranslation } from 'react-i18next';
import { Management } from '../Management/Management';
import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { DangerZone } from '../DangerZone';

interface ManagementTabProps {
  config: {
    showRoleManagement: boolean;
    showDangerZone: boolean;
    showConfiguration: boolean;
  };
}

export const ManagementTab = ({ config }: ManagementTabProps) => {
  const { id = '' } = useParams();

  const { t: tTabs } = useTranslation('security', {
    keyPrefix: 'details.tabs',
  });

  const tabs = useMemo(() => {
    const tabs = [];

    if (config.showRoleManagement) {
      tabs.push({
        content: <RoleManagement />,
        header: tTabs('roleManagement'),
      });
    }
    if (config.showDangerZone) {
      tabs.push({ content: <DangerZone />, header: 'Danger Zone' });
    }
    if (config.showConfiguration) {
      tabs.push({
        content: <Management id={id} />,
        header: tTabs('configuration'),
      });
    }

    return tabs;
  }, [config, tTabs, id]);

  return (
    <Box w={'full'} h={'full'}>
      <Tabs tabs={tabs} variant="secondary" />
    </Box>
  );
};
