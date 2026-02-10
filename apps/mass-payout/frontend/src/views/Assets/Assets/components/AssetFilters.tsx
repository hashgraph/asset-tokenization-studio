// SPDX-License-Identifier: Apache-2.0

import { Box, Stack } from "@chakra-ui/react";
import { SearchInputController, SelectController } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { Control } from "react-hook-form";
import { PlaceholderWithIcon } from "../../Components/PlaceholderWithIcon";

interface AssetFiltersFormValues {
  assetType: string;
  search: string;
}

interface AssetFiltersProps {
  control: Control<AssetFiltersFormValues>;
  assetTypeOptions: { value: string; label: string }[];
}

export const AssetFilters = ({ control, assetTypeOptions }: AssetFiltersProps) => {
  const { t } = useTranslation("assets");

  return (
    <Stack direction="row" mb={6} alignItems="center" gap={4}>
      <Box w="full" maxW={"280px"}>
        <SelectController
          control={control}
          id="assetType"
          placeholder={<PlaceholderWithIcon />}
          options={assetTypeOptions}
          isSearchable={false}
        />
      </Box>
      <Box w="full" maxW={"280px"}>
        <SearchInputController
          id="search"
          placeholder={t("filters.searchPlaceholder")}
          control={control}
          onSearch={() => {}}
        />
      </Box>
    </Stack>
  );
};
