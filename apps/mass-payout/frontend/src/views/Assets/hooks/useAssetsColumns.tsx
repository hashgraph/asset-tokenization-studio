// SPDX-License-Identifier: Apache-2.0

import { Asset } from "@/services/AssetService";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import { Button, Link, Tag, ClipboardButton, Text } from "io-bricks-ui";
import { HStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { AssetStatus } from "../../../utils/assetTransforms";

export const useAssetsColumns = (): { columns: ColumnDef<Asset, any>[] } => {
  const { t } = useTranslation("assets");
  const columnsHelper = createColumnHelper<Asset>();

  const columns = [
    columnsHelper.accessor("name", {
      header: t("table.headers.name"),
      size: 160,
      cell: ({ getValue }) => getValue(),
      enableSorting: false,
    }),
    columnsHelper.accessor("symbol", {
      header: t("table.headers.symbol"),
      size: 113,
      cell: ({ getValue }) => getValue(),
      enableSorting: false,
    }),
    columnsHelper.accessor("type", {
      header: () => (
        <Text textAlign="left" overflow="hidden" h="40px" w="50px">
          {t("table.headers.assetType")}
        </Text>
      ),
      size: 87,
      enableSorting: false,
      cell: ({ getValue }) => getValue(),
    }),
    columnsHelper.accessor("hederaTokenAddress", {
      header: () => (
        <Text textAlign="left" overflow="hidden" w="100px">
          {t("table.headers.hederaAdress")}
        </Text>
      ),
      size: 194,
      enableSorting: false,
      cell: ({ getValue }) => {
        const assetId = getValue();
        return (
          <HStack spacing="-80px">
            <Button
              as={Link}
              target="_blank"
              href={`https://hashscan.io/testnet/contract/${assetId}`}
              variant="table"
              onClick={(e) => e.stopPropagation()}
            >
              {assetId}
            </Button>
            <ClipboardButton value={assetId} />
          </HStack>
        );
      },
    }),
    columnsHelper.accessor("evmTokenAddress", {
      header: () => (
        <Text textAlign="left" overflow="hidden" w="100px">
          {t("table.headers.evmTokenAddress")}
        </Text>
      ),
      size: 160,
      enableSorting: false,
      cell: ({ row }) => {
        const evmAddress = row.original.evmTokenAddress;
        return (
          <HStack>
            <Button
              as={Link}
              target="_blank"
              href={`https://etherscan.io/address/${evmAddress}`}
              variant="table"
              onClick={(e) => e.stopPropagation()}
            >
              {evmAddress.slice(0, 10)}...{evmAddress.slice(-8)}
            </Button>
            <ClipboardButton value={evmAddress} />
          </HStack>
        );
      },
    }),
    columnsHelper.accessor("lifeCycleCashFlowHederaAddress", {
      header: () => (
        <Text textAlign="left" overflow="hidden" w="110px">
          {t("table.headers.distributionsHedera")}
        </Text>
      ),
      size: 191,
      enableSorting: false,
      cell: ({ getValue }) => {
        const cashFlowId = getValue();
        return (
          <HStack spacing="-90px">
            <Button
              as={Link}
              target="_blank"
              href={`https://hashscan.io/testnet/contract/${cashFlowId}`}
              variant="table"
              onClick={(e) => e.stopPropagation()}
            >
              {cashFlowId}
            </Button>
            <ClipboardButton value={cashFlowId as string} />
          </HStack>
        );
      },
    }),

    columnsHelper.accessor("lifeCycleCashFlowEvmAddress", {
      header: () => (
        <Text textAlign="left" overflow="hidden" w="110px">
          {t("table.headers.distributionsEVM")}
        </Text>
      ),
      size: 180,
      enableSorting: false,
      cell: ({ row }) => {
        const evmCashFlowAddress = row.original.lifeCycleCashFlowEvmAddress;
        return (
          <HStack>
            <Button
              as={Link}
              target="_blank"
              href={`https://etherscan.io/address/${evmCashFlowAddress}`}
              variant="table"
              onClick={(e) => e.stopPropagation()}
            >
              {evmCashFlowAddress.slice(0, 10)}...
              {evmCashFlowAddress.slice(-8)}
            </Button>
            <ClipboardButton value={evmCashFlowAddress} />
          </HStack>
        );
      },
    }),
    columnsHelper.accessor("isPaused", {
      header: t("table.headers.status"),
      size: 100,
      enableSorting: false,
      cell: ({ getValue }) => {
        const isPaused = getValue();
        const status = isPaused ? t(AssetStatus.PAUSED) : t(AssetStatus.ACTIVE);
        const variant = isPaused ? "paused" : "active";
        return <Tag label={status} variant={variant} size="md" />;
      },
    }),
  ];

  return { columns };
};
