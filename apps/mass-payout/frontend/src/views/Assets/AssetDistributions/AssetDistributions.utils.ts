// SPDX-License-Identifier: Apache-2.0

import { TFunction } from "i18next";
import {
  DistributionFilterType,
  StatusFilterMap,
  FilteredDistributionsResult,
  ColumnsByTab,
  AssetDistributionData,
  AssetDistributionColumn,
} from "./AssetDistributions.types";

/**
 * Filters distributions by status based on the filter type
 */
export const getFilteredDistributionsByStatus = (
  data: AssetDistributionData[] | undefined,
  filterType: DistributionFilterType,
  statusFilterMap: StatusFilterMap,
): AssetDistributionData[] => {
  const rawData = data || [];
  const filterFn = statusFilterMap[filterType];

  const filtered = rawData.filter((distribution) => {
    const shouldInclude = filterFn ? filterFn(distribution) : true;
    return shouldInclude;
  });

  return filtered;
};

/**
 * Filters distributions by type/subtype
 */
export const filterByDistributionType = (
  distributions: AssetDistributionData[],
  selectedDistributionType: string,
): AssetDistributionData[] => {
  if (!selectedDistributionType || selectedDistributionType === "all" || selectedDistributionType === "") {
    return distributions;
  }

  return distributions.filter((distribution) => {
    return distribution.type === selectedDistributionType || distribution.subtype === selectedDistributionType;
  });
};

/**
 * Filters distributions by search term
 */
export const filterBySearchTerm = (
  distributions: AssetDistributionData[],
  searchTerm: string,
): AssetDistributionData[] => {
  if (!searchTerm) {
    return distributions;
  }

  const searchLower = searchTerm.toLowerCase();
  return distributions.filter((distribution) => {
    const matches = distribution.id.toLowerCase().includes(searchLower);
    return matches;
  });
};

/**
 * Applies pagination to the filtered distributions
 */
export const applyPagination = (
  distributions: AssetDistributionData[],
  pageIndex: number,
  pageSize: number,
): FilteredDistributionsResult => {
  const totalFilteredElements = distributions.length;
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = distributions.slice(startIndex, endIndex);

  return {
    filteredDistributions: paginatedData,
    totalFilteredElements,
  };
};

/**
 * Gets the complete filtered and paginated distributions
 */
export const getProcessedDistributions = ({
  data,
  activeFilter,
  statusFilterMap,
  selectedDistributionType,
  searchTerm,
  pageIndex,
  pageSize,
}: {
  data: AssetDistributionData[] | undefined;
  activeFilter: DistributionFilterType;
  statusFilterMap: StatusFilterMap;
  selectedDistributionType: string;
  searchTerm: string;
  pageIndex: number;
  pageSize: number;
}): FilteredDistributionsResult => {
  let filtered = getFilteredDistributionsByStatus(data, activeFilter, statusFilterMap);
  filtered = filterByDistributionType(filtered, selectedDistributionType);
  filtered = filterBySearchTerm(filtered, searchTerm);

  return applyPagination(filtered, pageIndex, pageSize);
};

/**
 * Checks if a distribution row is clickable based on its status
 */
export const isDistributionRowClickable = (status: string): boolean => {
  return status === "FAILED" || status === "COMPLETED";
};

/**
 * Calculates total pages for pagination
 */
export const calculateTotalPages = (totalElements: number, pageSize: number): number => {
  return Math.ceil(totalElements / pageSize);
};

/**
 * Creates the columns mapping for different tab types
 */
export const createColumnsByTab = (
  upcomingColumns: AssetDistributionColumn[],
  ongoingColumns: AssetDistributionColumn[],
  completedColumns: AssetDistributionColumn[],
): ColumnsByTab => ({
  upcoming: upcomingColumns,
  ongoing: ongoingColumns,
  completed: completedColumns,
});

/**
 * Gets columns for a specific tab type
 */
export const getColumnsForTab = (
  columnsByTab: ColumnsByTab,
  filterType: DistributionFilterType,
  fallbackColumns: AssetDistributionColumn[],
): AssetDistributionColumn[] => {
  return columnsByTab[filterType] || fallbackColumns;
};

/**
 * Creates tab configuration for distribution tabs
 */
export const createDistributionTabs = (
  createTabContentFn: (filterType: DistributionFilterType) => JSX.Element,
  t: TFunction,
) => [
  {
    content: createTabContentFn("upcoming"),
    header: t("subTabs.upcoming"),
  },
  {
    content: createTabContentFn("ongoing"),
    header: t("subTabs.ongoing"),
  },
  {
    content: createTabContentFn("completed"),
    header: t("subTabs.completed"),
  },
];
