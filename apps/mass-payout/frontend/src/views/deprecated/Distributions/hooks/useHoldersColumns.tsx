// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/**
 * @deprecated This component is not currently used. Kept for potential future usage.
 */

import { useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { HStack, Text } from "@chakra-ui/react";
import { ClipboardButton, Tag } from "io-bricks-ui";
import { useTranslation } from "react-i18next";

export interface HolderData {
  walletAddress: string;
  attemptDate: string;
  status: "FAILED" | "PENDING" | "RETRYING";
  retryCount: number;
  hederaId: string;
}

const columnHelper = createColumnHelper<HolderData>();

export const useHoldersColumns = () => {
  const { t } = useTranslation("distributions");

  return useMemo(
    () => [
      columnHelper.accessor("walletAddress", {
        header: t("detail.table.headers.walletAddress"),
        cell: ({ getValue }) => {
          const address = getValue();
          const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
          return (
            <HStack spacing={2}>
              <Text fontSize="sm" color="gray.700">
                {truncatedAddress}
              </Text>
              <ClipboardButton value={address} size="sm" variant="ghost" aria-label={t("detail.table.copyAddress")} />
            </HStack>
          );
        },
      }),
      columnHelper.accessor("hederaId", {
        header: t("detail.table.headers.hederaId"),
        cell: ({ getValue }) => {
          const hederaId = getValue();
          const truncatedId = `${hederaId.slice(0, 6)}...${hederaId.slice(-4)}`;
          return (
            <HStack spacing={2}>
              <Text fontSize="sm" color="gray.700">
                {truncatedId}
              </Text>
              <ClipboardButton value={hederaId} size="sm" variant="ghost" aria-label={t("detail.table.copyHederaId")} />
            </HStack>
          );
        },
      }),
      columnHelper.accessor("attemptDate", {
        header: t("detail.table.headers.attemptDate"),
        cell: ({ getValue }) => (
          <Text fontSize="sm" color="gray.700">
            {getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor("status", {
        header: t("detail.table.headers.status"),
        cell: ({ getValue }) => {
          const status = getValue();
          const statusVariantMap: Record<string, "error" | "info" | "warning"> = {
            FAILED: "error",
            PENDING: "info",
            RETRYING: "warning",
          };

          const getVariant = () => statusVariantMap[status] || "info";
          return (
            <Tag variant={getVariant()} size="sm">
              {status}
            </Tag>
          );
        },
      }),
      columnHelper.accessor("retryCount", {
        header: t("detail.table.headers.retryCount"),
        cell: ({ getValue }) => (
          <Text fontSize="sm" color="gray.700">
            {getValue()}
          </Text>
        ),
      }),
    ],
    [t],
  );
};
