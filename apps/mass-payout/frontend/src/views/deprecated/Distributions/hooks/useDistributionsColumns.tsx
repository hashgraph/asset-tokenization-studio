// SPDX-License-Identifier: Apache-2.0

import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Button, Link, Tag, ClipboardButton } from "io-bricks-ui";
import { HStack } from "@chakra-ui/react";
import { ProcessStatus } from "@/types/status";
// @ts-nocheck
/**
 * @deprecated This component is not currently used. Kept for potential future usage.
 */

export interface DistributionData {
  id: string;
  corporateActionID: string;
  executionDate: string;
  status: string;
  amount?: number;
  createdAt: string;
  updatedAt: string;
  asset: {
    id: string;
    name: string;
    type: string;
    symbol: string;
    hederaTokenAddress: string;
    evmTokenAddress: string;
    lifeCycleCashFlowHederaAddress?: string;
    lifeCycleCashFlowEvmAddress?: string;
    maturityDate?: string;
    isPaused: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export const useDistributionsColumns = () => {
  const columnHelper = createColumnHelper<DistributionData>();
  const { t } = useTranslation("distributions", { keyPrefix: "table.headers" });

  return useMemo(() => {
    const columns = {
      distributionId: columnHelper.accessor("id", {
        header: "Distribution ID",
        size: 120,
        enableSorting: false,
        cell: ({ getValue }) => {
          const distributionId = getValue();
          const truncatedId = `${distributionId.slice(0, 8)}...${distributionId.slice(-4)}`;
          return (
            <Button
              as={Link}
              target="_blank"
              href={`https://hashscan.io/testnet/contract/${distributionId}`}
              variant="table"
              onClick={(e) => e.stopPropagation()}
            >
              {truncatedId}
            </Button>
          );
        },
      }),
      distributionType: columnHelper.accessor((row) => (row.corporateActionID ? "Corporate Action" : "Manual"), {
        header: t("distributionType"),
        size: 110,
        enableSorting: false,
        cell: ({ getValue }) => getValue(),
      }),
      assetType: columnHelper.accessor((row) => row.asset.type, {
        header: t("assetType"),
        size: 90,
        enableSorting: false,
        cell: ({ getValue }) => getValue(),
      }),
      assetName: columnHelper.accessor((row) => row.asset.name, {
        header: t("assetName"),
        size: 140,
        enableSorting: false,
        cell: ({ getValue }) => getValue(),
      }),
      assetId: columnHelper.accessor((row) => row.asset.id, {
        header: t("assetId"),
        size: 100,
        enableSorting: false,
        cell: ({ getValue }) => {
          const assetId = getValue();
          const truncatedAssetId = assetId.length > 10 ? `${assetId.slice(0, 8)}...` : assetId;
          return (
            <HStack spacing="-15px">
              <Button
                as={Link}
                target="_blank"
                href={`https://hashscan.io/testnet/contract/${assetId}`}
                variant="table"
                onClick={(e) => e.stopPropagation()}
              >
                {truncatedAssetId}
              </Button>
              <ClipboardButton value={assetId} />
            </HStack>
          );
        },
      }),
      evmTokenAddress: columnHelper.accessor((row) => row.asset.evmTokenAddress, {
        header: t("assetEvmAddress"),
        size: 150,
        enableSorting: false,
        cell: ({ getValue }) => {
          const evmAddress = getValue();
          const truncatedAddress = `${evmAddress.slice(0, 11)}...${evmAddress.slice(-4)}`;
          return (
            <HStack spacing="-15px">
              <Button
                as={Link}
                target="_blank"
                href={`https://etherscan.io/address/${evmAddress}`}
                variant="table"
                onClick={(e) => e.stopPropagation()}
              >
                {truncatedAddress}
              </Button>
              <ClipboardButton value={evmAddress} />
            </HStack>
          );
        },
      }),
      lifecycleCashFlowId: columnHelper.accessor((row) => row.asset.lifeCycleCashFlowHederaAddress || "", {
        header: t("lifecycleCashFlowId"),
        size: 140,
        enableSorting: false,
        cell: ({ getValue }) => {
          const flowId = getValue();
          if (!flowId) return "-";
          return (
            <HStack spacing="-50px">
              <Button
                as={Link}
                target="_blank"
                href={`https://hashscan.io/testnet/contract/${flowId}`}
                variant="table"
                onClick={(e) => e.stopPropagation()}
              >
                {flowId}
              </Button>
              <ClipboardButton value={flowId} />
            </HStack>
          );
        },
      }),
      status: columnHelper.accessor((row) => row.status, {
        header: t("status"),
        size: 90,
        enableSorting: false,
        cell: ({ getValue }) => {
          const rawStatus = getValue();

          const statusMap = {
            completed: {
              status: ProcessStatus.COMPLETED,
              variant: "success" as const,
            },
            scheduled: {
              status: ProcessStatus.SCHEDULED,
              variant: "scheduled" as const,
            },
            "in progress": {
              status: ProcessStatus.IN_PROGRESS,
              variant: "info" as const,
            },
            failed: { status: ProcessStatus.FAILED, variant: "error" as const },
            cancelled: {
              status: ProcessStatus.CANCELLED,
              variant: "error" as const,
            },
          };
          const { status, variant } =
            statusMap[rawStatus.toLowerCase() as keyof typeof statusMap] || statusMap.scheduled;
          return <Tag label={status} variant={variant} size="md" />;
        },
      }),
      amount: columnHelper.accessor((row) => row.amount || 0, {
        header: t("amount"),
        size: 70,
        enableSorting: false,
        cell: ({ getValue }) => {
          const amount = getValue();
          return amount > 0 ? `$${amount.toLocaleString()}` : "$100";
        },
      }),
    };

    return [
      columns.distributionId,
      columns.distributionType,
      columns.assetType,
      columns.assetName,
      columns.amount,
      columns.assetId,
      columns.evmTokenAddress,
      columns.lifecycleCashFlowId,
      columns.status,
    ];
  }, [t, columnHelper]);
};
