// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/**
 * @deprecated This component is not currently used. Kept for potential future usage.
 */

import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMemo, useState, useEffect } from "react";
import { Tabs, Tag, Breadcrumb } from "io-bricks-ui";
import { HStack, Stack, Spacer, VStack } from "@chakra-ui/react";
import { Details } from "./Details";

//Not using this view jet
export const DistributionDetail = () => {
  const { id = "" } = useParams();
  const { t } = useTranslation("distributions");
  const [searchParams, setSearchParams] = useSearchParams();

  // TODO: Replace with getDistribution endpoint from backend when it is ready
  const distributionData = {
    distributionId: id || "0.0.123456",
    actionType: "Manual",
    totalAmount: "$100",
    batchCount: 10,
    holders: 50,
    assetId: "0.0.890123",
    lifecycleCashFlowId: "0.0.456789",
    name: "Hedera Asset Test",
    assetType: "Bond",
    executionDate: "01/01/2024",
    maturityDate: "31/01/2025",
  };

  const distributionLabel = `${t("detail.title")} - ${distributionData.distributionId}`;
  const routes = useBreadcrumbs({});

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const tabMap = {
    details: 0,
    holders: 1,
  };

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabMap[tabParam as keyof typeof tabMap] !== undefined) {
      setActiveTabIndex(tabMap[tabParam as keyof typeof tabMap]);
    }
  }, [searchParams]);

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
    const tabNames = ["details", "holders"];
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("tab", tabNames[index]);
    setSearchParams(newSearchParams);
  };

  const tabs = useMemo(() => {
    const distributionTabs = [
      {
        content: <Details distributionData={distributionData} isLoading={false} />,
        header: t("detail.tabs.details"),
      },
      {
        content: <DistributionFailedHolders />,
        header: t("detail.tabs.holders"),
      },
    ];

    return distributionTabs;
  }, [id, distributionData, t]);

  return (
    <>
      <VStack alignItems="left" gap="12px" mb={6}>
        <Breadcrumb items={routes} />
        <HStack align="center" w="full">
          <HStack align="center" spacing={2}>
            <GobackButton label={distributionLabel} mr={4} />
            <Tag label={t("detail.status.failed")} variant="error" size="md" />
          </HStack>
          <Spacer />
        </HStack>
      </VStack>

      <Stack w="full" h="full" borderRadius={1} gap={4}>
        <Tabs tabs={tabs} variant="primary" index={activeTabIndex} onChange={handleTabChange} />
      </Stack>
    </>
  );
};
