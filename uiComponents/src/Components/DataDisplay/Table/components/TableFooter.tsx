import { Text } from "@/Components/Foundations/Text";
import { Flex } from "@chakra-ui/react";
import React from "react";
import { useTableContext } from "../Table";
import { Pagination } from "./Pagination";

export const TableFooter = () => {
  const {
    styles,
    totalElements,
    pagination,
    totalElementsText = totalElements! > 1 ? "records found" : "record found",
  } = useTableContext();

  if (!totalElements) return <></>;

  return (
    <Flex justify="space-between" mt={4}>
      {pagination?.pageSize && <Pagination />}
      <Text sx={styles.footerText}>
        {totalElements} {totalElementsText}
      </Text>
    </Flex>
  );
};
