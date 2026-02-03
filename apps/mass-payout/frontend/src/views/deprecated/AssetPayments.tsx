// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck
/**
 * @deprecated This component is not currently used. Kept for potential future usage.
 */

import { Box, Stack } from "@chakra-ui/react";
import { Table, Text, SearchInputController } from "io-bricks-ui";
import { useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import { useTable } from "@/hooks/useTable";
import { ProcessStatus } from "@/types/status";
import { RoutePath } from "@/router/RoutePath";
import { useTranslation } from "react-i18next";

interface PaymentData {
  paymentId: string;
  creationDate: string;
  paidAmount: number;
  batchCount: number;
  holders: number;
  paymentType: string;
  status: ProcessStatus;
  progress: number;
}

const mockAssetPayments: PaymentData[] = [
  {
    paymentId: "0.0.123456",
    creationDate: "09/10/2024",
    paidAmount: 1500.5,
    batchCount: 80,
    holders: 90,
    paymentType: "Recurrent",
    status: ProcessStatus.IN_PROGRESS,
    progress: 75,
  },
  {
    paymentId: "0.0.234567",
    creationDate: "08/10/2024",
    paidAmount: 2300.75,
    batchCount: 60,
    holders: 90,
    paymentType: "Trigger on deposit",
    status: ProcessStatus.FAILED,
    progress: 45,
  },
  {
    paymentId: "0.0.345678",
    creationDate: "04/10/2024",
    paidAmount: 5000.0,
    batchCount: 80,
    holders: 90,
    paymentType: "One shot",
    status: ProcessStatus.COMPLETED,
    progress: 100,
  },
];

export const AssetPayments = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payments] = useState<PaymentData[]>(mockAssetPayments);
  const table = useTable();
  const columns = useAssetPaymentsColumns();
  const { t } = useTranslation("assets");

  const { control } = useForm({
    mode: "onChange",
    defaultValues: {
      status: "",
      search: "",
    },
  });

  const selectedStatus = useWatch({ control, name: "status" });
  const searchTerm = useWatch({ control, name: "search" });

  const filteredPayments = useMemo(() => {
    let filtered = payments;

    if (selectedStatus && selectedStatus !== "all" && selectedStatus !== "") {
      filtered = filtered.filter((payment) => payment.status === selectedStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter((payment) => payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return filtered;
  }, [payments, selectedStatus, searchTerm]);

  //TODO: Remove when getAssetPayments endpoint is ready, just testing manual pagination with local data
  const paginatedPayments = useMemo(() => {
    const startIndex = table.pagination.pageIndex * table.pagination.pageSize;
    const endIndex = startIndex + table.pagination.pageSize;
    return filteredPayments.slice(startIndex, endIndex);
  }, [filteredPayments, table.pagination.pageIndex, table.pagination.pageSize]);

  return (
    <>
      <Box bg="neutral.50" borderRadius="lg" boxShadow="sm" p={6} flex="1" display="flex" flexDirection="column">
        <Text textStyle="ElementsSemiboldLG" color="neutral.900" mb={6}>
          {t("detail.tabs.paymentsTab.subtitle")}
        </Text>

        <Stack direction="row" mb={6} alignItems="center" gap={4}>
          <Box w="full" maxW={"280px"}>
            <SearchInputController
              id="search"
              name="search"
              placeholder="Search by payment ID"
              onSearch={() => {}}
              control={control}
            />
          </Box>
        </Stack>

        <Box flex="1" display="flex" flexDirection="column" minHeight="0">
          <Table
            name="asset-payments"
            columns={columns}
            data={paginatedPayments}
            onClickRow={(row) => {
              if (row.status === ProcessStatus.FAILED && id) {
                navigate(
                  RoutePath.FAILED_HOLDERS.replace(":id", id)
                    .replace(":type", "payment")
                    .replace(":itemId", row.paymentId),
                );
              }
            }}
            totalElements={filteredPayments.length}
            totalPages={Math.ceil(filteredPayments.length / table.pagination.pageSize)}
            {...table}
          />
        </Box>
      </Box>
    </>
  );
};
