import { Box, Center, Flex } from "@chakra-ui/layout";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import { type BoxProps as ChakraBoxProps } from "@chakra-ui/layout";
import { createContext } from "@chakra-ui/react-context";
import {
  Table as ChakraTable,
  Tbody,
  Tr,
  Skeleton,
  Td,
} from "@chakra-ui/react";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import React, { Fragment, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type {
  Table as TableT,
  Header,
  ColumnDef,
  PaginationState,
  OnChangeFn,
  SortingState,
  Row,
} from "@tanstack/react-table";

import { TableRow } from "./components/TableRow";
import { SortIcon } from "./components/SortIcon";
import { TableFooter } from "./components/TableFooter";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";

export const tablePartsList: Array<
  | "headerContainer"
  | "footerText"
  | "header"
  | "cell"
  | "rowContainer"
  | "container"
  | "tableContainer"
  | "title"
  | "subtext"
  | "sortIcon"
  | "empty"
  | "rowExpander"
  | "rowContainerExpanded"
  | "cellIcon"
  | "headerIcon"
> = [
  "header",
  "headerContainer",
  "cell",
  "rowContainer",
  "container",
  "tableContainer",
  "title",
  "subtext",
  "sortIcon",
  "empty",
  "rowExpander",
  "rowContainerExpanded",
  "cellIcon",
  "headerIcon",
];

type Parts = typeof tablePartsList;

export interface TableThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}

export type TableThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;

export interface TableProps<TData> extends ChakraBoxProps {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  showFooter?: boolean;
  name: string;
  onClickRow?: (row: TData) => void;
  onMouseOverRow?: (row: TData) => void;
  onMouseLeaveRow?: (row: TData) => void;
  totalElements?: number;
  pagination?: PaginationState;
  sorting?: SortingState;
  totalPages?: number;
  size?: string;
  variant?: string;
  setPagination?: OnChangeFn<PaginationState>;
  setSorting?: OnChangeFn<SortingState>;
  paginationText?: string;
  totalElementsText?: string;
  defaultColumnSize?: number;
  isLoading?: boolean;
  loadingColumnsCount?: number;
  emptyComponent?: React.ReactNode;
  enableExpanding?: boolean;
  rowExpandedContent?: React.FC<{ row: Row<TData> }>;
  allowMultiExpand?: boolean;
}

export const Table = <D extends object>({
  data,
  columns,
  variant,
  size,
  sorting,
  setSorting,
  setPagination,
  pagination,
  totalPages,
  totalElements,
  onClickRow,
  onMouseOverRow,
  onMouseLeaveRow,
  name,
  showFooter = true,
  defaultColumnSize = 138,
  isLoading,
  loadingColumnsCount,
  noOfLines = 1,
  emptyComponent,
  enableExpanding,
  rowExpandedContent: RowExpandedContent,
  allowMultiExpand,
  ...props
}: TableProps<D>) => {
  const processedColumns = useMemo(
    () =>
      isLoading
        ? columns.map((col) => ({
            ...col,
            cell: () => <Skeleton height={2} w="full" />,
          }))
        : columns,
    [columns, isLoading]
  );
  const processedData = useMemo(
    () => (isLoading ? Array(loadingColumnsCount).fill({}) : data || []),
    [data, isLoading, loadingColumnsCount]
  );

  const table = useReactTable({
    columns: processedColumns,
    data: processedData,
    defaultColumn: {
      size: defaultColumnSize,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableExpanding,
    getExpandedRowModel: getExpandedRowModel(),
    onPaginationChange: setPagination,
    pageCount: totalPages ?? -1,
    state: {
      sorting,
      pagination,
    },
    manualSorting: true,
    manualPagination: true,
  });

  const styles = useChakraMultiStyleConfig("Table", {
    variant,
    size,
    isLoading,
  }) as TableThemeStyle;

  const [headerGroup] = table.getHeaderGroups();

  const onClickSort = (header: Header<D, unknown>, event: React.MouseEvent) => {
    table.setPageIndex(0);
    const setSort = header.column.getToggleSortingHandler();
    setSort?.(event);
  };

  return (
    <TableContextProvider
      value={{
        styles,
        noOfLines,
        pagination,
        totalPages,
        totalElements,
        // @ts-ignore TODO: context with generic?
        onClickRow,
        // @ts-ignore
        onMouseOverRow,
        // @ts-ignore
        onMouseLeaveRow,
        allowMultiExpand,
        enableExpanding,
        ...table,
      }}
    >
      <Box {...props}>
        <Box sx={styles.container}>
          <ChakraTable data-testid={`table-${name}`} sx={styles.tableContainer}>
            <Tbody>
              <Tr sx={styles.headerContainer}>
                {enableExpanding && (
                  <Box key={"expander"} as="th" sx={styles.headerIcon} />
                )}
                {headerGroup.headers.map((header) => (
                  <Box
                    key={header.id}
                    as="th"
                    w={header.getSize()}
                    maxW={header.getSize()}
                    sx={styles.header}
                  >
                    <Flex
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      <Box noOfLines={noOfLines}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </Box>
                      {header.column.getCanSort() && (
                        <SortIcon
                          type={header.column.getIsSorted()}
                          onSort={(event) => onClickSort(header, event)}
                        />
                      )}
                    </Flex>
                  </Box>
                ))}
              </Tr>
              {table.getRowModel().rows.map((row) => {
                return (
                  <Fragment key={row.id}>
                    <TableRow row={row} />
                    {row.getIsExpanded() && RowExpandedContent && (
                      <Tr>
                        <Td colSpan={row.getVisibleCells().length + 1}>
                          <Box sx={styles.rowContainerExpanded}>
                            <RowExpandedContent row={row} />
                          </Box>
                        </Td>
                      </Tr>
                    )}
                  </Fragment>
                );
              })}
            </Tbody>
          </ChakraTable>
        </Box>
        {emptyComponent && !isLoading && processedData.length === 0 && (
          <Center sx={styles.empty}>{emptyComponent}</Center>
        )}

        {showFooter && <TableFooter />}
      </Box>
    </TableContextProvider>
  );
};

export interface TableContext<D extends object = {}>
  extends TableT<D>,
    Pick<
      TableProps<D>,
      | "pagination"
      | "totalElements"
      | "totalPages"
      | "onClickRow"
      | "onMouseOverRow"
      | "onMouseLeaveRow"
      | "paginationText"
      | "totalElementsText"
      | "noOfLines"
      | "allowMultiExpand"
      | "enableExpanding"
    > {
  styles: TableThemeStyle;
}

export const [TableContextProvider, useTableContext] =
  createContext<TableContext>({ name: "TableContext" });
