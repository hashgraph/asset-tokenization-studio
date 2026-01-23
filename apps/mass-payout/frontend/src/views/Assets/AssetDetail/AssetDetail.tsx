// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Text, Spinner } from "io-bricks-ui";
import { useDisclosure, Box, Flex } from "@chakra-ui/react";
import {
  useDisableAssetSync,
  useEnableAssetSync,
  useGetAsset,
  usePauseAsset,
  useUnpauseAsset,
} from "../hooks/queries/AssetQueries";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";
import { RoutePath } from "@/router/RoutePath";
import { AssetHeader } from "./components/AssetHeader";
import { TabsConfiguration } from "./components/TabsConfiguration";
import { PopupConfigurations } from "./components/PopupConfigurations";

const tabMap = {
  details: 0,
  distributions: 1,
  payments: 2,
};

export const AssetDetail = () => {
  const { id = "" } = useParams();
  const { t } = useTranslation("assets");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isImportOpen, onOpen: onImportOpen, onClose: onImportClose } = useDisclosure();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: asset, isLoading: isLoadingAsset, error } = useGetAsset(id);

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isImportingCorporateActions, setIsImportingCorporateActions] = useState<boolean>(asset?.syncEnabled ?? true);

  const pauseAssetMutation = usePauseAsset();
  const unpauseAssetMutation = useUnpauseAsset();
  const enableSyncMutation = useEnableAssetSync();
  const disableSyncMutation = useDisableAssetSync();

  const routes = useBreadcrumbs({});

  useEffect(() => {
    if (asset) {
      setIsPaused(asset.isPaused);
      setIsImportingCorporateActions(asset.syncEnabled);
    }
  }, [asset]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabMap[tabParam as keyof typeof tabMap] !== undefined) {
      setActiveTabIndex(tabMap[tabParam as keyof typeof tabMap]);
    }
  }, [searchParams]);

  const handleNewDistribution = () => {
    navigate(RoutePath.NEW_DISTRIBUTION.replace(":id", id));
  };

  const handleImportCorporateActions = () => {
    onImportOpen();
  };

  const handleImportConfirm = () => {
    const newSyncState = !isImportingCorporateActions;
    if (newSyncState) {
      enableSyncMutation.mutate(id);
    } else {
      disableSyncMutation.mutate(id);
    }
    setIsImportingCorporateActions(newSyncState);
    onImportClose();
  };

  const handleImportCancel = () => {
    onImportClose();
  };

  if (isLoadingAsset) {
    return (
      <Flex gap={4} alignItems={"center"} p={6}>
        <Spinner />
        <Text>{t("loading", "Loading asset...")}</Text>
      </Flex>
    );
  }

  if (error || !asset) {
    return (
      <Box p={6}>
        <Text color="red.500">{t("error", "Error loading asset or asset not found")}</Text>
      </Box>
    );
  }

  const handlePauseUnpause = async () => {
    if (!asset.id) return;

    try {
      if (isPaused) {
        await unpauseAssetMutation.mutateAsync(asset.id);
      } else {
        await pauseAssetMutation.mutateAsync(asset.id);
      }
      setIsPaused(!isPaused);
      onClose();
    } catch (error) {
      console.error("Error pausing asset:", error);
    }
  };

  const isMutationLoading = pauseAssetMutation.isPending || unpauseAssetMutation.isPending;

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    const tabNames = ["details", "distributions", "payments"];
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("tab", tabNames[index]);
    setSearchParams(newSearchParams);
  };

  return (
    <>
      <AssetHeader asset={asset} routes={routes} isPaused={isPaused} />
      <TabsConfiguration
        asset={asset}
        isLoadingAsset={isLoadingAsset}
        id={id}
        isPaused={isPaused}
        isImportingCorporateActions={isImportingCorporateActions}
        activeTabIndex={activeTabIndex}
        onPauseUnpause={onOpen}
        onImportCorporateActions={handleImportCorporateActions}
        onNewDistribution={handleNewDistribution}
        onTabChange={handleTabChange}
      />
      <PopupConfigurations
        asset={asset}
        isPaused={isPaused}
        isImportingCorporateActions={isImportingCorporateActions}
        isOpen={isOpen}
        isImportOpen={isImportOpen}
        isMutationLoading={isMutationLoading}
        onClose={onClose}
        onImportClose={handleImportCancel}
        onConfirmPauseUnpause={handlePauseUnpause}
        onConfirmImport={handleImportConfirm}
      />
    </>
  );
};
