import {
  CouponViewModel,
  GetAllCouponsRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { useGetAllCoupons } from "../../../../hooks/queries/useCoupons";
import { useParams } from "react-router-dom";
import { createColumnHelper } from "@tanstack/table-core";
import { Table, Text } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { COUPONS_FACTOR, DATE_TIME_FORMAT } from "../../../../utils/constants";
import { formatDate } from "../../../../utils/format";

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
      cell: (row) => `${parseInt(row.getValue()) / COUPONS_FACTOR}%`,
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
