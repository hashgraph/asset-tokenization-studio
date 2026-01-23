// SPDX-License-Identifier: Apache-2.0

import { useMemo } from "react";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { HStack, Text } from "@chakra-ui/react";
import { Button, ClipboardButton, Link, Tag } from "io-bricks-ui";
import { DistributionsDetailsStatus } from "@/types/status";
import { useTranslation } from "react-i18next";
import { useStatusIcons } from "./useStatusIcons";

export interface DistributionsDetailsData {
  paymentId: string;
  receieverAddressHedera: string;
  receieverAddressEvm: string;
  amount: string;
  status: DistributionsDetailsStatus;
  executionDate: string;
  txHash: string;
}

const columnHelper = createColumnHelper<DistributionsDetailsData>();

const statusMap = {
  Pending: DistributionsDetailsStatus.PENDING,
  Retrying: DistributionsDetailsStatus.RETRYING,
  Success: DistributionsDetailsStatus.SUCCESS,
  Failed: DistributionsDetailsStatus.FAILED,
} as const;

export const useDistributionsDetailsColumns = (): ColumnDef<DistributionsDetailsData, any>[] => {
  const { t } = useTranslation("distributionsDetails");
  const { getStatusVariants } = useStatusIcons();
  return useMemo(
    () => [
      columnHelper.accessor("paymentId", {
        header: t("table.headers.paymentId"),
        size: 169,
        enableSorting: false,
        cell: ({ getValue }) => getValue() || "-",
      }),
      columnHelper.accessor("receieverAddressHedera", {
        header: () => (
          <Text textAlign="left" overflow="hidden" h="40px" w="110px">
            {t("table.headers.receieverAddressHedera")}
          </Text>
        ),
        size: 172,
        enableSorting: false,
        cell: ({ getValue }) => {
          const address = getValue();
          return (
            <HStack>
              <Text fontFamily="mono" fontSize="sm" color="neutral.700">
                {address}
              </Text>
              <ClipboardButton value={address} />
            </HStack>
          );
        },
      }),
      columnHelper.accessor("receieverAddressEvm", {
        header: () => (
          <Text textAlign="left" overflow="hidden" h="40px" w="110px">
            {t("table.headers.receieverAddressEvm")}
          </Text>
        ),
        size: 167,
        enableSorting: false,
        cell: ({ getValue }) => {
          const address = getValue();
          return (
            <HStack>
              <Text fontFamily="mono" fontSize="sm" color="neutral.700">
                {address}
              </Text>
              <ClipboardButton value={address} />
            </HStack>
          );
        },
      }),
      columnHelper.accessor("amount", {
        header: t("table.headers.amount"),
        size: 100,
        enableSorting: false,
      }),
      columnHelper.accessor("executionDate", {
        header: () => (
          <Text textAlign="left" overflow="hidden" h="40px" w="75px">
            {t("table.headers.executionDate")}
          </Text>
        ),
        size: 200,
        enableSorting: false,
      }),
      columnHelper.accessor("txHash", {
        header: t("table.headers.txHash"),
        size: 120,
        enableSorting: false,
        cell: ({ getValue }) => {
          const txHash = getValue();
          const truncatedId = `${txHash.slice(0, 8)}...${txHash.slice(-4)}`;
          return (
            <Button
              as={Link}
              target="_blank"
              href={`https://hashscan.io/testnet/transactionsById/${txHash}`}
              variant="table"
              onClick={(e) => e.stopPropagation()}
            >
              {truncatedId}
            </Button>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: t("table.headers.status"),
        size: 120,
        enableSorting: false,
        cell: ({ getValue }) => {
          const backendStatus = getValue();
          const status = statusMap[backendStatus as keyof typeof statusMap] || DistributionsDetailsStatus.PENDING;
          const { tagVariant } = getStatusVariants(status);
          return <Tag variant={tagVariant} size="sm" label={status} />;
        },
      }),
    ],
    [],
  );
};
