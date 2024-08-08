import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { Text } from "@/Components/Foundations/Text";
import { IconButton } from "@Components/Interaction/IconButton";
import { Flex } from "@chakra-ui/react";
import {
  CaretCircleDoubleLeft,
  CaretCircleDoubleRight,
  CaretCircleLeft,
  CaretCircleRight,
} from "@phosphor-icons/react";
import React from "react";
import { useTableContext } from "../Table";

export const Pagination = () => {
  const {
    styles,
    totalPages,
    previousPage,
    getCanPreviousPage,
    nextPage,
    getCanNextPage,
    setPageIndex,
    getState,
    paginationText = "Page",
  } = useTableContext();
  const currentPage = getState().pagination.pageIndex;

  return (
    <Flex align="center">
      <IconButton
        size="xs"
        variant="tertiary"
        aria-label="Go to first page"
        onClick={() => setPageIndex(0)}
        isDisabled={currentPage === 0}
        icon={<PhosphorIcon size="xxs" as={CaretCircleDoubleLeft} />}
      />
      <IconButton
        size="xs"
        variant="tertiary"
        aria-label="Go to previous page"
        onClick={previousPage}
        isDisabled={!getCanPreviousPage()}
        icon={<PhosphorIcon size="xxs" as={CaretCircleLeft} />}
      />
      <Text sx={styles.footerText}>
        {paginationText} {currentPage + 1}/{totalPages}
      </Text>
      <IconButton
        size="xs"
        variant="tertiary"
        aria-label="Go to next page"
        onClick={() => nextPage()}
        isDisabled={!getCanNextPage()}
        icon={<PhosphorIcon size="xxs" as={CaretCircleRight} />}
      />
      <IconButton
        size="xs"
        variant="tertiary"
        aria-label="Go to last page"
        onClick={() => setPageIndex(totalPages! - 1)}
        isDisabled={currentPage === totalPages! - 1}
        icon={<PhosphorIcon size="xxs" as={CaretCircleDoubleRight} />}
      />
    </Flex>
  );
};
