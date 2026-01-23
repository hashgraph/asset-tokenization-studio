import { useMemo } from "react";
import { Tabs } from "io-bricks-ui";
import { Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { AssetDistributions } from "../../AssetDistributions/AssetDistributions";
import type { Asset } from "@/services/AssetService";
import { Details } from "./Details";

interface TabsConfigurationProps {
  asset: Asset | null;
  isLoadingAsset: boolean;
  id: string;
  isPaused: boolean;
  isImportingCorporateActions: boolean;
  activeTabIndex: number;
  onPauseUnpause: () => void;
  onImportCorporateActions: () => void;
  onNewDistribution: () => void;
  onTabChange: (index: number) => void;
}

export const TabsConfiguration = ({
  asset,
  isLoadingAsset,
  id,
  isPaused,
  isImportingCorporateActions,
  activeTabIndex,
  onPauseUnpause,
  onImportCorporateActions,
  onNewDistribution,
  onTabChange,
}: TabsConfigurationProps) => {
  const { t } = useTranslation("assets");

  const tabs = useMemo(() => {
    const assetTabs = [
      {
        content: <Details assetData={asset || null} isLoading={isLoadingAsset} />,
        header: t("detail.tabs.details.title"),
      },
      {
        content: (
          <AssetDistributions
            assetId={id}
            isPaused={isPaused}
            onPauseUnpause={onPauseUnpause}
            onImportCorporateActions={onImportCorporateActions}
            isImportingCorporateActions={isImportingCorporateActions}
            handleNewDistribution={onNewDistribution}
          />
        ),
        header: t("detail.tabs.distributions"),
      },
    ];

    return assetTabs;
  }, [
    asset,
    isLoadingAsset,
    t,
    isPaused,
    isImportingCorporateActions,
    id,
    onPauseUnpause,
    onImportCorporateActions,
    onNewDistribution,
  ]);

  return (
    <Stack w="full" h="full" borderRadius={1} gap={4}>
      <Tabs tabs={tabs} variant="primary" index={activeTabIndex} onChange={onTabChange} />
    </Stack>
  );
};
