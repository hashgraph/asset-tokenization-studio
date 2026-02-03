// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from "react-i18next";
import { useForm, useWatch } from "react-hook-form";
import { useTable } from "@/hooks/useTable";
import { useAssetsColumns } from "../hooks/useAssetsColumns";
import { useGetAssets } from "../hooks/queries/AssetQueries";
import { AssetHeader } from "./components/AssetHeader";
import { AssetFilters } from "./components/AssetFilters";
import { AssetTable } from "./components/AssetTable";

export const Assets = () => {
  const { t } = useTranslation("assets");
  const table = useTable();
  const { columns } = useAssetsColumns();
  const { pagination, sorting } = table;

  const { data, isLoading } = useGetAssets({
    page: pagination.pageIndex,
    sort: sorting,
    size: pagination.pageSize,
  });

  const { control } = useForm({
    mode: "onChange",
    defaultValues: {
      assetType: "",
      search: "",
    },
  });

  const assetTypeOptions = [
    { value: "all", label: t("filters.options.allTypes") },
    { value: "Bond", label: t("filters.options.bond") },
    { value: "Equity", label: t("filters.options.equity") },
  ];

  const selectedAssetType = useWatch({ control, name: "assetType" });
  const searchTerm = useWatch({ control, name: "search" });

  const filteredAssets = (data?.queryData || []).filter((asset) => {
    if (selectedAssetType && selectedAssetType !== "all" && selectedAssetType !== "") {
      if (asset.type !== selectedAssetType) return false;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        asset.name.toLowerCase().includes(searchLower) ||
        asset.hederaTokenAddress?.toLowerCase().includes(searchLower) ||
        asset.evmTokenAddress?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  return (
    <>
      <AssetHeader />
      <AssetFilters control={control} assetTypeOptions={assetTypeOptions} />
      <AssetTable
        isLoading={isLoading}
        columns={columns}
        filteredAssets={filteredAssets}
        totalPages={data?.page.totalPages || 0}
        table={table}
      />
    </>
  );
};
