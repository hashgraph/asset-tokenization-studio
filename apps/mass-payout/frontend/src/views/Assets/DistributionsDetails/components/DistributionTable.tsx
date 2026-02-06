// SPDX-License-Identifier: Apache-2.0

import { Box } from "@chakra-ui/react";
import { Table, Text } from "io-bricks-ui";
import { ColumnDef } from "@tanstack/react-table";
import { DistributionsDetailsData } from "../../hooks/useDistributionsDetailsColumns";
import { UseTableReturn } from "@/hooks/useTable";

interface DistributionTableProps {
  title: string;
  columns: ColumnDef<DistributionsDetailsData>[];
  data: DistributionsDetailsData[];
  totalElements: number;
  totalPages: number;
  table: UseTableReturn;
}

export const DistributionTable: React.FC<DistributionTableProps> = ({
  title,
  columns,
  data,
  totalElements,
  totalPages,
  table,
}) => {
  return (
    <Box bg="neutral.50" borderRadius="lg" boxShadow="sm" p={6} flex="1" display="flex" flexDirection="column">
      <Text textStyle="ElementsSemiboldLG" color="neutral.900" mb={6}>
        {title}
      </Text>
      <Box flex="1" display="flex" flexDirection="column" minHeight="0">
        <Table
          name="ca-distributions-details"
          columns={columns}
          data={data}
          totalElements={totalElements}
          totalPages={totalPages}
          {...table}
        />
      </Box>
    </Box>
  );
};
