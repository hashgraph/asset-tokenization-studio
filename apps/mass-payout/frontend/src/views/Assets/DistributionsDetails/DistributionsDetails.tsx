// SPDX-License-Identifier: Apache-2.0

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Holder } from "@/services/DistributionService";
import { DistributionsDetailsStatus } from "@/types/status";
import { format } from "date-fns";
import { DistributionsDetailsData, useDistributionsDetailsColumns } from "../hooks/useDistributionsDetailsColumns";
import { formatNumber } from "@/utils/number-fs";
import { useTable } from "@/hooks/useTable";
import { useTranslation } from "react-i18next";
import {
  useGetDistribution,
  useGetDistributionHolders,
  useRetryDistribution,
} from "../hooks/queries/DistributionQueries";
import { DistributionHeader } from "./components/DistributionHeader";
import { DistributionTable } from "./components/DistributionTable";

const mapHolderToDetailsData = (holder: Holder): DistributionsDetailsData => {
  const statusMap: Record<string, DistributionsDetailsStatus> = {
    PENDING: DistributionsDetailsStatus.PENDING,
    RETRYING: DistributionsDetailsStatus.RETRYING,
    SUCCESS: DistributionsDetailsStatus.SUCCESS,
    FAILED: DistributionsDetailsStatus.FAILED,
  };
  return {
    paymentId: holder.batchPayout.id,
    receieverAddressHedera: holder.holderHederaAddress,
    receieverAddressEvm: holder.holderEvmAddress,
    amount: holder.amount ? `$ ${formatNumber(holder.amount)}` : "-",
    executionDate: format(new Date(holder.updatedAt || 0), "dd/MM/yyyy"),
    txHash: holder.batchPayout.hederaTransactionId,
    status: statusMap[holder.status] || DistributionsDetailsStatus.PENDING,
  };
};

export const DistributionsDetails = () => {
  const navigate = useNavigate();
  const { itemId: distributionId, id: assetId } = useParams<{
    type: string;
    itemId: string;
    id: string;
  }>();

  const table = useTable();
  const columns = useDistributionsDetailsColumns();
  const { t } = useTranslation("distributionsDetails");

  const { data: distribution } = useGetDistribution(distributionId || "");

  const breadcrumbItems = [
    { label: "Asset list", link: "/assets" },
    { label: "Assets details", link: `/assets/${assetId}` },
    {
      label: "Distribution details",
      link: "#",
    },
  ];

  const { data: holdersData } = useGetDistributionHolders({
    distributionId: distributionId || "",
    page: table.pagination.pageIndex,
    size: table.pagination.pageSize,
  });

  const distributionDetails = useMemo(() => {
    if (!holdersData?.queryData) return [];
    return holdersData.queryData.map(mapHolderToDetailsData);
  }, [holdersData]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const retryDistributionMutation = useRetryDistribution();

  const retryAll = () => {
    if (!distributionId) {
      console.error("Distribution ID not available");
      return;
    }

    retryDistributionMutation.mutate(distributionId, {
      onSuccess: () => {
        console.log("Retry all successful");
      },
      onError: (error) => {
        console.error("Error retrying distribution:", error);
      },
    });
  };

  return (
    <>
      <DistributionHeader
        breadcrumbItems={breadcrumbItems}
        title={t("title")}
        distribution={distribution}
        onGoBack={handleGoBack}
        onRetryAll={retryAll}
        isRetryPending={retryDistributionMutation.isPending}
        t={t}
      />
      <DistributionTable
        title={t("title")}
        columns={columns}
        data={distributionDetails}
        totalElements={distributionDetails.length}
        totalPages={holdersData?.page?.totalPages || 0}
        table={table}
      />
    </>
  );
};

export default DistributionsDetails;
