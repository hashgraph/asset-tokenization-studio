import { Control } from "react-hook-form";
import { NavigateFunction } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { TFunction } from "i18next";
import { UseTableReturn } from "@/hooks/useTable";
import { Asset } from "@/services/AssetService";

export interface AssetDistributionData {
  id: string;
  asset: Asset & {
    distributedAmount?: number;
  };
  type: string;
  corporateActionID?: string;
  concept?: string;
  executionDate?: string;
  status: string;
  trigger?: string;
  actions?: string;
  holdersNumber?: string;
  createdAt: string;
  updatedAt: string;
  amount?: string;
  amountType?: string;
  subtype?: string;
  nextExecutionTime?: string;
  recurrency?: string;
}

export type AssetDistributionColumn = ColumnDef<AssetDistributionData, any>;

export type DistributionFilterType = "upcoming" | "ongoing" | "completed";

export interface AssetDistributionsProps {
  assetId: string;
  isPaused?: boolean;
  onPauseUnpause?: () => void;
  onImportCorporateActions?: () => void;
  handleNewDistribution?: () => void;
  isImportingCorporateActions?: boolean;
}

export interface AssetDistributionsFormValues {
  search: string;
  distributionType: string;
}

export interface StatusFilterMap {
  upcoming: (item: AssetDistributionData) => boolean;
  ongoing: (item: AssetDistributionData) => boolean;
  completed: (item: AssetDistributionData) => boolean;
}

export interface TabTitleMap {
  upcoming: string;
  ongoing: string;
  completed: string;
}

export type ColumnsByTab = Record<DistributionFilterType, AssetDistributionColumn[]>;

export interface DistributionTabContent {
  title: string;
  columns: AssetDistributionColumn[];
  filteredDistributions: AssetDistributionData[];
  totalElements: number;
  totalPages: number;
}

export interface FilteredDistributionsResult {
  filteredDistributions: AssetDistributionData[];
  totalFilteredElements: number;
}

export interface TabContentProps {
  filterType: "upcoming" | "ongoing" | "completed";
  control: Control<AssetDistributionsFormValues>;
  navigate: NavigateFunction;
  table: UseTableReturn;
  t: TFunction;
  columns: AssetDistributionColumn[];
  filteredDistributions: AssetDistributionData[];
  totalFilteredElements: number;
  isLoading: boolean;
  id?: string;
}
