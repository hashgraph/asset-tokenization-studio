// SPDX-License-Identifier: Apache-2.0

import { apiRequest, buildUrl } from "./api";
import { BackendUrls } from "./BackendUrls";
import { AmountType, DistributionSubtype } from "./DistributionService";

export enum AssetType {
  EQUITY = "Equity",
  BOND = "Bond",
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  symbol: string;
  hederaTokenAddress: string;
  evmTokenAddress: string;
  lifeCycleCashFlowHederaAddress?: string;
  lifeCycleCashFlowEvmAddress: string;
  maturityDate?: string;
  isPaused: boolean;
  syncEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SortParam {
  id: string;
  desc: boolean;
}

export interface GetAssetsParams {
  filters?: {
    value?: string;
  };
  page?: number;
  sort?: SortParam[];
  size?: number;
}

export interface PaginatedResponse<T> {
  queryData: T[];
  page: {
    totalElements: number;
    totalPages: number;
    pageIndex: number;
    pageSize: number;
  };
}

export interface AssetDistribution {
  id: string;
  asset: Asset;
  type: string;
  corporateActionID: string;
  executionDate: string;
  status: string;
  concept: string;
  amount?: string;
  amountType?: string;
  subtype?: string;
  actions?: string;
  trigger?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetAssetDistributionsParams {
  assetId: string;
  page?: number;
  size?: number;
  search?: string;
}

export interface CreateManualPayoutParams {
  assetId: string;
  subtype: DistributionSubtype;
  executeAt?: string;
  amount: string;
  amountType: AmountType;
  recurrency?: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  concept?: string;
}

export interface AssetMetadata {
  hederaTokenAddress: string;
  name: string;
  symbol: string;
  assetType: AssetType;
  maturityDate?: string;
}

export class AssetService {
  static async getAssets(params: GetAssetsParams = {}): Promise<PaginatedResponse<Asset>> {
    const { filters, page = 0, sort = [], size = 10 } = params;

    const query = new URLSearchParams();
    filters?.value && query.append("search", filters.value);
    query.append("page", (page + 1).toString()); // Backend expects 1-based
    query.append("limit", size.toString());

    if (sort.length > 0) {
      sort.forEach((col: SortParam) => query.append("sort", `${col.id},${col.desc ? "desc" : "asc"}`));
    }

    const url = buildUrl(BackendUrls.GetAssets, {});
    const response = await apiRequest<{
      items: Asset[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`${url}?${query.toString()}`, {
      method: "GET",
    });

    return {
      queryData: response.items,
      page: {
        totalElements: response.total,
        totalPages: response.totalPages,
        pageIndex: response.page - 1, // Convert back to 0-based
        pageSize: response.limit,
      },
    };
  }

  static async getAsset(assetId: string): Promise<Asset> {
    const url = buildUrl(BackendUrls.GetAsset, { assetId });
    return apiRequest<Asset>(url, {
      method: "GET",
    });
  }

  static async getAssetMetadata(hederaTokenAddress: string): Promise<AssetMetadata> {
    const url = buildUrl(BackendUrls.GetAssetMetadata, { hederaTokenAddress });
    return apiRequest<AssetMetadata>(url, {
      method: "GET",
    });
  }

  static async importAsset(hederaTokenAddress: string): Promise<Asset> {
    return apiRequest<Asset>(BackendUrls.ImportAsset, {
      method: "POST",
      body: { hederaTokenAddress },
    });
  }

  static async pauseAsset(assetId: string): Promise<void> {
    const url = buildUrl(BackendUrls.PauseAsset, { assetId });
    return apiRequest<void>(url, {
      method: "PATCH",
    });
  }

  static async unpauseAsset(assetId: string): Promise<void> {
    const url = buildUrl(BackendUrls.UnpauseAsset, { assetId });
    return apiRequest<void>(url, {
      method: "PATCH",
    });
  }

  static async getAssetDistributions(
    params: GetAssetDistributionsParams,
  ): Promise<PaginatedResponse<AssetDistribution>> {
    const { assetId, page = 0, size = 10, search } = params;

    const query = new URLSearchParams();
    if (search) query.append("search", search);
    query.append("page", (page + 1).toString());
    query.append("limit", size.toString());

    const url = buildUrl(BackendUrls.GetAssetDistributions, { assetId });
    const response = await apiRequest<{
      items: AssetDistribution[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`${url}?${query.toString()}`, {
      method: "GET",
    });

    return {
      queryData: response.items,
      page: {
        totalElements: response.total,
        totalPages: response.totalPages,
        pageIndex: response.page - 1,
        pageSize: response.limit,
      },
    };
  }

  static async createManualPayout(params: CreateManualPayoutParams): Promise<void> {
    const { assetId, ...body } = params;
    const url = buildUrl(BackendUrls.CreateManualPayout, { assetId });
    return apiRequest<void>(url, {
      method: "POST",
      body,
    });
  }

  static async enableAssetSync(assetId: string): Promise<Asset> {
    const url = buildUrl(BackendUrls.EnableAssetSync, { assetId });
    return apiRequest<Asset>(url, {
      method: "PATCH",
    });
  }

  static async disableAssetSync(assetId: string): Promise<Asset> {
    const url = buildUrl(BackendUrls.DisableAssetSync, { assetId });
    return apiRequest<Asset>(url, {
      method: "PATCH",
    });
  }
}
