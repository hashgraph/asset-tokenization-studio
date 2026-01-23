// SPDX-License-Identifier: Apache-2.0

import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { Box, Flex } from "@chakra-ui/react";
import { Tag, Progress } from "io-bricks-ui";
import { useStatusIcons } from "./useStatusIcons";
import { ProcessStatusType } from "../../../types/status";
import { useTranslation } from "react-i18next";

interface PaymentData {
  paymentId: string;
  creationDate: string;
  paidAmount: number;
  batchCount: number;
  holders: number;
  status: ProcessStatusType;
  paymentType: string;
  progress: number;
}

const columnHelper = createColumnHelper<PaymentData>();

export const useAssetPaymentsColumns = () => {
  const { t } = useTranslation("assets");
  const { renderProgressIndicator, getStatusVariants } = useStatusIcons();

  return useMemo(
    () => [
      columnHelper.accessor("creationDate", {
        header: t("detail.tabs.paymentsTab.creationDate"),
        size: 160,
        enableSorting: false,
      }),
      columnHelper.accessor("paymentType", {
        header: t("detail.tabs.paymentsTab.paymentType"),
        size: 160,
        enableSorting: false,
      }),
      columnHelper.accessor("paidAmount", {
        header: t("detail.tabs.paymentsTab.paidAmount"),
        size: 160,
        enableSorting: false,
        cell: ({ getValue }) => `$${getValue().toFixed(2)}`,
      }),
      columnHelper.accessor("batchCount", {
        header: t("detail.tabs.paymentsTab.batchCount"),
        size: 160,
        enableSorting: false,
      }),
      columnHelper.accessor("holders", {
        header: t("detail.tabs.paymentsTab.holders"),
        size: 160,
        enableSorting: false,
      }),
      columnHelper.accessor("status", {
        header: t("detail.tabs.paymentsTab.status"),
        size: 320,
        enableSorting: false,
        cell: ({ row }) => {
          const status = row.original.status;
          const progress = row.original.progress;

          const { tagVariant, progressVariant } = getStatusVariants(status);

          return (
            <Flex align="center" gap={0} w="full" h="40px">
              <Box w="120px" display="flex" alignItems="center">
                <Tag
                  variant={tagVariant}
                  size="md"
                  w="full"
                  h="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  label={status}
                />
              </Box>
              <Box w="200px" display="flex" alignItems="center" pl={3}>
                <Progress variant={progressVariant} value={progress} size="md" w="150px" borderRadius="md" />
                <Box w="40px" display="flex" alignItems="center" justifyContent="center" ml={2}>
                  {renderProgressIndicator(status, progress)}
                </Box>
              </Box>
            </Flex>
          );
        },
      }),
    ],
    [renderProgressIndicator, getStatusVariants],
  );
};
