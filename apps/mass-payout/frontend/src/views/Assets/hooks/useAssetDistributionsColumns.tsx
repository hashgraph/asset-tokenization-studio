// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Tag, Progress, IconButton, PhosphorIcon, Weight, PopUp } from "io-bricks-ui";
import { Box, Flex, Text, HStack } from "@chakra-ui/react";
import { useStatusIcons } from "./useStatusIcons";
import { ProcessStatusType } from "../../../types/status";
import { Warning, XSquare } from "@phosphor-icons/react";
import { format } from "date-fns";
import { formatNumber } from "@/utils/number-fs";
import { useCancelDistribution } from "./queries/DistributionQueries";
import { AssetDistributionData } from "../AssetDistributions/AssetDistributions.types";

const statusMap = {
  COMPLETED: "Completed" as ProcessStatusType,
  FAILED: "Failed" as ProcessStatusType,
  IN_PROGRESS: "In Progress" as ProcessStatusType,
  SCHEDULED: "Scheduled" as ProcessStatusType,
  CANCELLED: "Cancelled" as ProcessStatusType,
} as const;

const progressByStatus: Record<ProcessStatusType, number> = {
  Failed: 100,
  Completed: 100,
  "In Progress": 50,
  Scheduled: 0,
  Cancelled: 0,
};

const calculateProgressByStatus = (status: ProcessStatusType): number => {
  return progressByStatus[status] ?? 0;
};

export const useAssetDistributionsColumns = ({ tabType }: { tabType?: "upcoming" | "ongoing" | "completed" }) => {
  const columnHelper = createColumnHelper<AssetDistributionData>();
  const { t } = useTranslation("distributions", { keyPrefix: "table.headers" });
  const { t: tAssets } = useTranslation("assets");
  const { renderProgressIndicator, getStatusVariants } = useStatusIcons();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [distributionToCancel, setDistributionToCancel] = useState<string | null>(null);

  const handleConfirmCancel = async () => {
    if (distributionToCancel) {
      try {
        await cancelDistribution.mutateAsync(distributionToCancel);
        setShowCancelModal(false);
        setDistributionToCancel(null);
      } catch (error) {
        console.error("Error canceling distribution:", error);
      }
    }
  };

  const handleCancelModal = () => {
    setShowCancelModal(false);
    setDistributionToCancel(null);
  };
  const cancelDistribution = useCancelDistribution();

  return useMemo(() => {
    // CONFIG SIZES BY TABTYPE
    const columnSizes = {
      upcoming: {
        distributionId: 120,
        concept: 110,
        type: 100,
        trigger: 100,
        configuratedAmount: 140,
        nextExecutionTime: 130,
        status: 120,
        progress: 160,
        actions: 100,
      },
      ongoing: {
        distributionId: 90,
        concept: 90,
        type: 110,
        trigger: 90,
        configuratedAmount: 102,
        distributedAmount: 90,
        recipientHolders: 85,
        executionStartTime: 115,
        executionEndTime: 115,
        status: 90,
        progress: 90,
      },
      completed: {
        distributionId: 124,
        concept: 117,
        type: 124,
        trigger: 119,
        configuratedAmount: 120,
        distributedAmount: 120,
        recipientHolders: 110,
        executionStartTime: 123,
        executionEndTime: 123,
        status: 148,
      },
    };

    const currentSizes = columnSizes[tabType || "upcoming"] as Record<string, number>;

    const allColumns = {
      distributionId: columnHelper.accessor("id", {
        id: "distributionId",
        header: t("distributionId"),
        size: currentSizes.distributionId,
        enableSorting: false,
        cell: ({ getValue }) => getValue() || "-",
      }),
      concept: columnHelper.accessor("concept", {
        id: "concept",
        header: t("concept"),
        size: currentSizes.concept || 117,
        enableSorting: false,
        cell: ({ getValue }) => getValue() || "-",
      }),
      type: columnHelper.accessor("type", {
        id: "type",
        header: t("type"),
        size: currentSizes.type || 120,
        enableSorting: false,
        cell: ({ row }) => {
          const typeMap: Record<string, string> = {
            IMMEDIATE: "Manual",
            ONE_OFF: "Scheduled",
            RECURRING: "Recurring",
            AUTOMATED: "Automated",
            CORPORATE_ACTION: "Corp. Action",
          };
          const type = row.original.type;
          return typeMap[type] || (row.original.subtype ? typeMap[row.original.subtype] : type);
        },
      }),
      trigger: columnHelper.accessor((row) => row.type, {
        id: "trigger",
        header: t("trigger"),
        size: currentSizes.trigger || 120,
        enableSorting: false,
        cell: ({ row }) => {
          let recurrency = row.original?.recurrency?.toLowerCase();
          const typeTriggerMap: Record<string, string> = {
            IMMEDIATE: "Single Time",
            ONE_OFF: `Single Time`,
            RECURRING: `${recurrency?.charAt(0)?.toUpperCase()}${recurrency?.slice(1)}`,
            AUTOMATED: "On Deposit",
            CORPORATE_ACTION: "Single Time",
          };
          return typeTriggerMap[row.original.type] || typeTriggerMap[row.original.subtype || ""];
        },
      }),
      configuratedAmount: columnHelper.accessor((row) => row.amount, {
        id: "configuratedAmount",
        header: () => (
          <Text textAlign="left" overflow="hidden" h="40px" w="100px">
            {t("configuratedAmount")}
          </Text>
        ),
        size: currentSizes.configuratedAmount || 130,
        enableSorting: false,
        cell: ({ row }) => {
          const amountType = row.original.amountType;
          const amount = row.original.amount;
          if (!amount) return "-";
          return `${amountType === "FIXED" ? "$" : "%"} ${formatNumber(amount)}`;
        },
      }),
      distributedAmount: columnHelper.accessor((row) => row.asset?.distributedAmount, {
        id: "distributedAmount",
        header: () => (
          <Text textAlign="left" overflow="hidden" h="40px" w="100px">
            {t("distributedAmount")}
          </Text>
        ),
        size: currentSizes["distributedAmount"] ?? 130,
        enableSorting: false,
        cell: ({ row }) => {
          const amountType = row.original.amountType;
          const amount = row.original.amount;
          if (!amount) return "-";
          return `${amountType === "FIXED" ? "$" : "%"} ${formatNumber(amount)}`;
        },
      }),
      recipientHolders: columnHelper.accessor((row) => row?.holdersNumber, {
        id: "recipientHolders",
        header: () => (
          <Text textAlign="left" overflow="hidden" h={10} w={25}>
            {t("recipientHolders")}
          </Text>
        ),
        size: currentSizes["recipientHolders"] ?? 130,
        enableSorting: false,
        cell: ({ getValue }) => getValue(),
      }),
      nextExecutionTime: columnHelper.accessor("executionDate", {
        id: "executionDate",
        header: () => (
          <Text textAlign="left" overflow="hidden" h="40px" w="100px">
            {t("nextExecutionTime")}
          </Text>
        ),
        size: currentSizes["nextExecutionTime"] ?? 130,
        enableSorting: false,
        cell: ({ getValue }) => {
          if (!getValue()) return "-";
          const date = new Date(getValue() as string);
          return (
            <Box minH="40px" display="flex" flexDirection="column" justifyContent="center">
              <Text fontSize="sm" lineHeight="1.2" whiteSpace="nowrap">
                {format(date, "dd/MM/yyyy")}
              </Text>
              <Text fontSize="xs" lineHeight="1.2" whiteSpace="nowrap">
                {format(date, "HH:mm:ss")}
              </Text>
            </Box>
          );
        },
      }),
      executionStartTime: columnHelper.accessor("executionDate", {
        id: "createdAt",
        header: () => (
          <Text textAlign="left" overflow="hidden" h="40px" w="80px">
            {t("executionStartTime")}
          </Text>
        ),
        size: currentSizes["executionStartTime"] ?? 130,
        enableSorting: false,
        cell: ({ getValue }) => {
          if (!getValue()) return "-";
          const date = new Date(getValue() as string);
          return (
            <Box minH="40px" display="flex" flexDirection="column" justifyContent="center">
              <Text fontSize="sm" lineHeight="1.2" whiteSpace="nowrap">
                {format(date, "dd/MM/yyyy")}
              </Text>
              <Text fontSize="xs" lineHeight="1.2" whiteSpace="nowrap">
                {format(date, "HH:mm:ss")}
              </Text>
            </Box>
          );
        },
      }),
      executionEndTime: columnHelper.accessor("updatedAt", {
        id: "updatedAt",
        header: () => (
          <Text textAlign="left" overflow="hidden" h="40px" w="80px">
            {t("executionEndTime")}
          </Text>
        ),
        size: currentSizes["executionEndTime"] ?? 130,
        enableSorting: false,
        cell: ({ getValue }) => {
          if (!getValue()) return "-";
          const date = new Date(getValue());
          return (
            <Box minH="40px" display="flex" flexDirection="column" justifyContent="center">
              <Text fontSize="sm" lineHeight="1.2" whiteSpace="nowrap">
                {format(date, "dd/MM/yyyy")}
              </Text>
              <Text fontSize="xs" lineHeight="1.2" whiteSpace="nowrap">
                {format(date, "HH:mm:ss")}
              </Text>
            </Box>
          );
        },
      }),
      status: columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        size: currentSizes.status ?? 160,
        enableSorting: false,
        cell: ({ row }) => {
          const backendStatus = row.original.status;
          const status = statusMap[backendStatus as keyof typeof statusMap] || ("Scheduled" as ProcessStatusType);
          const { tagVariant } = getStatusVariants(status);
          return (
            <Tag
              variant={tagVariant}
              size="sm"
              display="flex"
              alignItems="center"
              justifyContent="center"
              label={status}
            />
          );
        },
      }),
      progress: columnHelper.accessor("status", {
        id: "progress",
        header: "",
        size: currentSizes.progress ?? 160,
        enableSorting: false,
        cell: ({ row }) => {
          const backendStatus = row.original.status;
          const status = statusMap[backendStatus as keyof typeof statusMap] || ("Scheduled" as ProcessStatusType);
          const progress = calculateProgressByStatus(status);
          const { progressVariant } = getStatusVariants(status);
          return (
            <Flex align="center" gap={2} w="full">
              <Progress variant={progressVariant} value={progress} size="md" w="150px" borderRadius="md" />
              <Box w={10} display="flex" alignItems="center" justifyContent="center">
                {renderProgressIndicator(status, progress)}
              </Box>
            </Flex>
          );
        },
      }),
      actions: columnHelper.accessor("actions", {
        id: "actions",
        header: t("actions"),
        size: currentSizes.actions ?? 120,
        enableSorting: false,
        cell: ({ row }) => {
          const distributionId = row.original.id;
          const status = row.original.status;
          const canCancel = status === "SCHEDULED" && row.original.type === "PAYOUT";

          const handleCancelDistribution = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (canCancel) {
              setDistributionToCancel(distributionId);
              setShowCancelModal(true);
            }
          };

          return (
            canCancel && (
              <HStack spacing={3}>
                <IconButton
                  aria-label="cancel-distribution"
                  icon={<PhosphorIcon as={XSquare} size="xs" weight={Weight.Fill} fill="red" />}
                  variant="tertiary"
                  size="xxs"
                  isDisabled={!canCancel || cancelDistribution.isPending}
                  isLoading={cancelDistribution.isPending}
                  onClick={handleCancelDistribution}
                />
              </HStack>
            )
          );
        },
      }),
    };
    const columnSets = {
      upcoming: [
        allColumns.distributionId,
        allColumns.concept,
        allColumns.type,
        allColumns.trigger,
        allColumns.configuratedAmount,
        allColumns.nextExecutionTime,
        allColumns.status,
        allColumns.actions,
      ],
      ongoing: [
        allColumns.distributionId,
        allColumns.concept,
        allColumns.type,
        allColumns.trigger,
        allColumns.configuratedAmount,
        allColumns.distributedAmount,
        allColumns.recipientHolders,
        allColumns.executionStartTime,
        allColumns.executionEndTime,
        allColumns.status,
        allColumns.progress,
      ],
      completed: [
        allColumns.distributionId,
        allColumns.concept,
        allColumns.type,
        allColumns.trigger,
        allColumns.configuratedAmount,
        allColumns.distributedAmount,
        allColumns.recipientHolders,
        allColumns.executionStartTime,
        allColumns.executionEndTime,
        allColumns.status,
      ],
    };

    return {
      columns: columnSets[tabType || "upcoming"],
      modal: (
        <PopUp
          id="cancelDistribution"
          icon={<PhosphorIcon as={Warning} size="md" weight={Weight.Light} />}
          isOpen={showCancelModal}
          onClose={handleCancelModal}
          title={tAssets("detail.popup.cancelDistribution.title")}
          description={tAssets("detail.popup.cancelDistribution.description")}
          confirmText={tAssets("detail.popup.cancelDistribution.confirmText")}
          cancelText={tAssets("detail.popup.cancelDistribution.cancelText")}
          onConfirm={handleConfirmCancel}
          onCancel={handleCancelModal}
          variant="error"
          confirmButtonProps={{
            isLoading: cancelDistribution.isPending,
            status: "danger",
          }}
        />
      ),
    };
  }, [
    t,
    tAssets,
    renderProgressIndicator,
    getStatusVariants,
    tabType,
    showCancelModal,
    distributionToCancel,
    cancelDistribution.isPending,
  ]);
};
