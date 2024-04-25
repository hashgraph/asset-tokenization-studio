import { type BoxProps as ChakraBoxProps } from "@chakra-ui/layout";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import React from "react";
import type { Table as TableT, ColumnDef, PaginationState, OnChangeFn, SortingState, Row } from "@tanstack/react-table";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
export declare const tablePartsList: Array<"headerContainer" | "footerText" | "header" | "cell" | "rowContainer" | "container" | "tableContainer" | "title" | "subtext" | "sortIcon" | "empty" | "rowExpander" | "rowContainerExpanded" | "cellIcon" | "headerIcon">;
type Parts = typeof tablePartsList;
export interface TableThemeConfiguration extends BaseMultiStyleConfiguration<Parts> {
}
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
    rowExpandedContent?: React.FC<{
        row: Row<TData>;
    }>;
    allowMultiExpand?: boolean;
}
export declare const Table: <D extends object>({ data, columns, variant, size, sorting, setSorting, setPagination, pagination, totalPages, totalElements, onClickRow, onMouseOverRow, onMouseLeaveRow, name, showFooter, defaultColumnSize, isLoading, loadingColumnsCount, noOfLines, emptyComponent, enableExpanding, rowExpandedContent: RowExpandedContent, allowMultiExpand, ...props }: TableProps<D>) => JSX.Element;
export interface TableContext<D extends object = {}> extends TableT<D>, Pick<TableProps<D>, "pagination" | "totalElements" | "totalPages" | "onClickRow" | "onMouseOverRow" | "onMouseLeaveRow" | "paginationText" | "totalElementsText" | "noOfLines" | "allowMultiExpand" | "enableExpanding"> {
    styles: TableThemeStyle;
}
export declare const TableContextProvider: React.Provider<TableContext<{}>>, useTableContext: () => TableContext<{}>;
export {};
