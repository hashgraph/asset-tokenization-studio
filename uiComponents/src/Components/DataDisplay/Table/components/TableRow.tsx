import { IconButton, PhosphorIcon } from "@/Components";
import { Box, Td, Tr } from "@chakra-ui/react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { flexRender, type Row } from "@tanstack/react-table";
import React from "react";
import { useTableContext } from "../Table";

export interface TableRowProps<T extends Object> {
  row: Row<T>;
}

export const TableRow = <T extends Object>({ row }: TableRowProps<T>) => {
  const {
    styles,
    noOfLines,
    onClickRow,
    onMouseOverRow,
    onMouseLeaveRow,
    allowMultiExpand,
    resetExpanded,
    enableExpanding,
  } = useTableContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rowIsClosed = !row.getIsExpanded();
    e.stopPropagation();
    if (!allowMultiExpand) resetExpanded();
    rowIsClosed ? row.toggleExpanded(true) : row.toggleExpanded(false);
  };

  return (
    <Tr
      data-testid={`row-${row?.index}`}
      key={row.id}
      w="full"
      onClick={() => onClickRow?.(row.original)}
      onMouseOver={() => onMouseOverRow?.(row.original)}
      onMouseLeave={() => onMouseLeaveRow?.(row.original)}
      cursor={onClickRow ? "pointer" : "default"}
      sx={styles.rowContainer}
    >
      {enableExpanding && (
        <Td key={`expander-${row?.index}`} sx={styles.cellIcon}>
          <IconButton
            aria-label={"expand-button"}
            icon={
              <PhosphorIcon as={row.getIsExpanded() ? CaretUp : CaretDown} />
            }
            onClick={handleClick}
            sx={styles.rowExpander}
          />
        </Td>
      )}
      {row.getVisibleCells().map((cell) => {
        const isFocusable = cell.column.columnDef.meta?.isFocusable ?? false;

        return (
          <Td
            key={cell.id}
            minW={cell.column.getSize()}
            sx={styles.cell}
            {...(isFocusable && {
              tabIndex: 0,
            })}
          >
            <Box noOfLines={noOfLines}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Box>
          </Td>
        );
      })}
    </Tr>
  );
};
