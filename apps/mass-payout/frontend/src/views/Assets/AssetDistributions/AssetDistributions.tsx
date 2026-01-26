// SPDX-License-Identifier: Apache-2.0

import { Box, HStack, Switch } from "@chakra-ui/react";
import { Text, Tabs, PhosphorIcon, Weight, Button } from "io-bricks-ui";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Pause, Play } from "@phosphor-icons/react";
import { useTable } from "@/hooks/useTable";
import { useAssetDistributionsColumns } from "../hooks/useAssetDistributionsColumns";
import { useGetAssetDistributions } from "../hooks/queries/AssetQueries";
import {
  AssetDistributionsProps,
  DistributionFilterType,
  AssetDistributionsFormValues,
} from "./AssetDistributions.types";
import {
  DEFAULT_FORM_VALUES,
  DISTRIBUTION_FILTER_TYPES,
  createStatusFilterMap,
  PAGINATION_CONFIG,
} from "./AssetDistributions.constants";
import {
  getProcessedDistributions,
  createColumnsByTab,
  getColumnsForTab,
  createDistributionTabs,
} from "./AssetDistributions.utils";
import { TabContent } from "./components/TabContent";

export const AssetDistributions = ({
  isPaused,
  onPauseUnpause,
  onImportCorporateActions,
  handleNewDistribution,
  isImportingCorporateActions,
}: AssetDistributionsProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const table = useTable();
  const { t } = useTranslation("assets");
  const [activeFilter, setActiveFilter] = useState<DistributionFilterType>("upcoming");
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const { control } = useForm<AssetDistributionsFormValues>({
    mode: "onChange",
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const selectedDistributionType = useWatch({
    control,
    name: "distributionType",
  });
  const searchTerm = useWatch({ control, name: "search" });

  const { data, isLoading } = useGetAssetDistributions({
    assetId: id || "",
    page: PAGINATION_CONFIG.DEFAULT_PAGE,
    size: PAGINATION_CONFIG.DEFAULT_SIZE,
  });

  const statusFilterMap = createStatusFilterMap();

  const { filteredDistributions, totalFilteredElements } = useMemo(() => {
    return getProcessedDistributions({
      data: data?.queryData,
      activeFilter,
      statusFilterMap,
      selectedDistributionType,
      searchTerm,
      pageIndex: table.pagination.pageIndex,
      pageSize: table.pagination.pageSize,
    });
  }, [
    data?.queryData,
    searchTerm,
    activeFilter,
    selectedDistributionType,
    table.pagination.pageIndex,
    table.pagination.pageSize,
  ]);

  const upcomingColumnsData = useAssetDistributionsColumns({
    tabType: "upcoming",
  });
  const ongoingColumnsData = useAssetDistributionsColumns({
    tabType: "ongoing",
  });
  const completedColumnsData = useAssetDistributionsColumns({
    tabType: "completed",
  });

  const columnsByTab = createColumnsByTab(
    upcomingColumnsData.columns,
    ongoingColumnsData.columns,
    completedColumnsData.columns,
  );

  const distributionTabs = useMemo(() => {
    const createTabContent = (filterType: DistributionFilterType) => {
      const columns = getColumnsForTab(columnsByTab, filterType, upcomingColumnsData.columns);
      return (
        <TabContent
          filterType={filterType}
          columns={columns}
          filteredDistributions={filteredDistributions}
          totalFilteredElements={totalFilteredElements}
          isLoading={isLoading}
          control={control}
          id={id}
          navigate={navigate}
          table={table}
          t={t}
        />
      );
    };

    return createDistributionTabs(createTabContent, t);
  }, [
    data?.queryData,
    filteredDistributions,
    upcomingColumnsData.columns,
    ongoingColumnsData.columns,
    completedColumnsData.columns,
    id,
    navigate,
    isLoading,
    table,
    control,
    t,
  ]);

  const handleTabChange = (index: number) => {
    setActiveFilter(DISTRIBUTION_FILTER_TYPES[index]);
    setActiveTabIndex(index);
    table.setPagination({ pageIndex: 0, pageSize: table.pagination.pageSize });
  };

  return (
    <>
      <HStack spacing={6} align="center" my={6} justify="flex-end">
        <HStack align="center" spacing={2}>
          <Switch isChecked={isImportingCorporateActions} onChange={onImportCorporateActions} />
          <Text textStyle="ElementsRegularXS" color="neutral.1000">
            {isImportingCorporateActions
              ? t("detail.buttons.importCorporateActions")
              : t("detail.buttons.notImportCorporateActions")}
          </Text>
        </HStack>
        <Button
          variant={isPaused ? "primary" : "secondary"}
          onClick={onPauseUnpause}
          leftIcon={<PhosphorIcon as={isPaused ? Play : Pause} size="xxs" weight={Weight.Light} />}
        >
          {isPaused ? t("detail.buttons.unpauseDistributions") : t("detail.buttons.pauseDistributions")}
        </Button>
        {!isPaused && (
          <Button variant="primary" onClick={handleNewDistribution}>
            {t("detail.buttons.newDistribution")}
          </Button>
        )}
      </HStack>
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
        <Box flex="1" display="flex" flexDirection="column" minHeight="0" w="full">
          <Tabs tabs={distributionTabs} variant="table" onChange={handleTabChange} index={activeTabIndex} w="full" />
        </Box>
      </Box>
      {upcomingColumnsData.modal}
    </>
  );
};
