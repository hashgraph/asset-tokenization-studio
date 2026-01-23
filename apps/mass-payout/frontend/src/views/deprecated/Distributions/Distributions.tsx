// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck
/**
 * @deprecated This component is not currently used. Kept for potential future usage.
 */

import { Box, Stack } from "@chakra-ui/react";
import { Table, Text, SearchInputController, SelectController } from "io-bricks-ui";
import { useForm, useWatch } from "react-hook-form";
import { useTable } from "@/hooks/useTable";
import { useTranslation } from "react-i18next";
import { RouterManager } from "@/router/RouterManager";
import { RouteName } from "@/router/RouteName";
import { PlaceholderWithIcon } from "@/views/Assets/Components/PlaceholderWithIcon";

export const Distributions = () => {
  const { t } = useTranslation("routes");
  const { t: tDistributions } = useTranslation("distributions");
  const table = useTable();
  const { pagination, sorting } = table;
  const columns = useDistributionsColumns();

  const { data, isLoading } = useGetDistributions({
    page: pagination.pageIndex,
    sort: sorting,
    size: pagination.pageSize,
  });

  const { control } = useForm({
    mode: "onChange",
    defaultValues: {
      distributionType: "",
      search: "",
    },
  });

  const distributionTypeOptions = [
    { value: "all", label: tDistributions("filters.options.allTypes") },
    { value: "Manual", label: tDistributions("filters.options.manual") },
    {
      value: "Corporate Action",
      label: tDistributions("filters.options.corporateAction"),
    },
  ];

  const selectedDistributionType = useWatch({
    control,
    name: "distributionType",
  });
  const searchTerm = useWatch({ control, name: "search" });

  const filteredDistributions = (data?.queryData || []).filter((distribution) => {
    if (selectedDistributionType && selectedDistributionType !== "all" && selectedDistributionType !== "") {
      const distributionType = distribution.corporateActionID ? "Corporate Action" : "Manual";
      if (distributionType !== selectedDistributionType) return false;
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        distribution.asset.name.toLowerCase().includes(searchLower) ||
        distribution.asset.id.toLowerCase().includes(searchLower) ||
        (distribution.asset.lifeCycleCashFlowHederaAddress || "").toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const onClickRow = (distribution: DistributionData) => {
    RouterManager.to(RouteName.DistributionsDetails, {
      params: { id: distribution.id },
    });
  };

  return (
    <>
      <Stack direction="row" justify="flex-start" align="center" mb={4}>
        <Text textStyle="HeadingBoldXL" color="neutral.800" ml={4}>
          {t("Distributions")}
        </Text>
      </Stack>

      <Box bg="neutral.50" borderRadius="lg" boxShadow="sm" p={6} flex="1" display="flex" flexDirection="column">
        <Text textStyle="ElementsSemiboldLG" color="neutral.900" mb={6}>
          {tDistributions("title")}
        </Text>

        <Stack direction="row" mb={6} alignItems="center" gap={4}>
          <Box w="full" maxW={"280px"}>
            <SelectController
              control={control}
              id="distributionType"
              placeholder={<PlaceholderWithIcon />}
              options={distributionTypeOptions}
            />
          </Box>
          <Box w="full" maxW={"280px"}>
            <SearchInputController
              id="search"
              placeholder={tDistributions("filters.searchPlaceholder")}
              onSearch={(search) => console.log("SEARCHING: ", search)}
              control={control}
            />
          </Box>
        </Stack>

        <Box flex="1" display="flex" flexDirection="column" minHeight="0">
          <Table
            name="distributions"
            columns={columns}
            data={filteredDistributions}
            isLoading={isLoading}
            onClickRow={onClickRow}
            totalElements={filteredDistributions.length}
            totalPages={data?.page.totalPages || 0}
            {...table}
          />
        </Box>
      </Box>
    </>
  );
};
