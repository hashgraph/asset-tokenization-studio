import { CouponViewModel, GetAllCouponsRequest } from "@hashgraph/asset-tokenization-sdk";
import { useGetAllCoupons } from "../../../../hooks/queries/useCoupons";
import { useParams } from "react-router-dom";
import { createColumnHelper } from "@tanstack/table-core";
import { Table, Text } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { DATE_TIME_FORMAT } from "../../../../utils/constants";
import { formatDate, formatNumberLocale } from "../../../../utils/format";

export const CouponsList = () => {
  const { id } = useParams();

  const { t } = useTranslation("security", {
    keyPrefix: "details.coupons.list",
  });

  const {
    data: coupons,
    isLoading: isLoadingCoupons,
    isFetching: isFetchingCoupons,
  } = useGetAllCoupons(
    new GetAllCouponsRequest({
      securityId: id!,
    }),
  );

  const columnHelper = createColumnHelper<CouponViewModel>();

  const columns = [
    columnHelper.accessor("couponId", {
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
    columnHelper.accessor("rate", {
      header: t("columns.rate"),
      cell: (row) =>
        `${formatNumberLocale(row.getValue(), row.row.original.rateDecimals ? row.row.original.rateDecimals - 2 : 0)}%`,
      enableSorting: false,
    }),
    columnHelper.accessor("startDate", {
      header: t("columns.startDate"),
      cell: (row) => formatDate(row.getValue(), DATE_TIME_FORMAT),
      enableSorting: false,
    }),
    columnHelper.accessor("endDate", {
      header: t("columns.endDate"),
      cell: (row) => formatDate(row.getValue(), DATE_TIME_FORMAT),
      enableSorting: false,
    }),
    columnHelper.accessor("fixingDate", {
      header: t("columns.fixingDate"),
      cell: (row) => formatDate(row.getValue(), DATE_TIME_FORMAT),
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
      data={coupons ?? []}
      name="coupons-list"
      emptyComponent={<Text>{t("emptyTable")}</Text>}
      isLoading={isLoadingCoupons || isFetchingCoupons}
    />
  );
};
