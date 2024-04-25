/// <reference types="react" />
import { type Row } from "@tanstack/react-table";
export interface TableRowProps<T extends Object> {
    row: Row<T>;
}
export declare const TableRow: <T extends Object>({ row }: TableRowProps<T>) => JSX.Element;
