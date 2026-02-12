// SPDX-License-Identifier: Apache-2.0

import { DividendsViewModel, GetAllDividendsRequest } from "@hashgraph/asset-tokenization-sdk";
import { useParams } from "react-router-dom";
import { createColumnHelper } from "@tanstack/table-core";
import { Table, Text } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { useGetAllDividends } from "../../../../hooks/queries/useGetSecurityDetails";
import { DATE_TIME_FORMAT } from "../../../../utils/constants";
import { formatDate } from "../../../../utils/format";

export const DividendsList = () => {
  const { id } = useParams();

  const { t } = useTranslation("security", {
    keyPrefix: "details.dividends.list",
  });

  const {
    data: dividends,
    isLoading: isLoadingDividends,
    isFetching: isFetchingDividends,
  } = useGetAllDividends(
    new GetAllDividendsRequest({
      securityId: id!,
    }),
  );

  const columnHelper = createColumnHelper<DividendsViewModel>();

  const columns = [
    columnHelper.accessor("dividendId", {
      header: t("columns.id"),
      enableSorting: true,
    }),
    columnHelper.accessor("recordDate", {
      header: t("columns.recordDate"),
      cell: (row) => formatDate(row.getValue(), DATE_TIME_FORMAT),
      enableSorting: false,
    }),
    columnHelper.accessor("executionDate", {
      header: t("columns.executionDate"),
      cell: (row) => formatDate(row.getValue(), DATE_TIME_FORMAT),
      enableSorting: false,
    }),
    columnHelper.accessor("amountPerUnitOfSecurity", {
      header: t("columns.dividendAmount"),
      enableSorting: false,
    }),
    columnHelper.accessor("snapshotId", {
      header: t("columns.snapshotId"),
      cell: (row) => row.getValue() ?? "-",
      enableSorting: false,
    }),
  ];

  return (
    <Table
      columns={columns}
      data={dividends ?? []}
      name="dividends-list"
      emptyComponent={<Text>{t("emptyTable")}</Text>}
      isLoading={isLoadingDividends || isFetchingDividends}
    />
  );
};
