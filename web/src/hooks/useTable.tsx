import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";

export interface UseTableReturn {
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  setPagination: Dispatch<SetStateAction<PaginationState>>;
  sorting: SortingState;
  setSorting: Dispatch<SetStateAction<SortingState>>;
}

export const useTable = (): UseTableReturn => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  return {
    pagination: {
      pageIndex,
      pageSize,
    },
    setPagination,
    sorting,
    setSorting,
  };
};
