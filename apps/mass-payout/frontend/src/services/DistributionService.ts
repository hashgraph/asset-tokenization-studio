// SPDX-License-Identifier: Apache-2.0

import { apiRequest, buildUrl } from "./api";
import { Asset, SortParam } from "./AssetService";
import { BackendUrls } from "./BackendUrls";

export type ProcessStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
export type DistributionType = "PAYOUT" | "CORPORATE_ACTION";
export type DistributionSubtype = "IMMEDIATE" | "RECURRING" | "ONE_OFF" | "AUTOMATED";
export type AmountType = "FIXED" | "PERCENTAGE";

export interface Distribution {
  id: string;
  asset: Asset;
  corporateActionID?: string;
  status: ProcessStatus;
  createdAt: string;
  updatedAt: string;
  amount?: string;
  amountType?: AmountType;
  subtype?: DistributionSubtype;
  executionDate?: string;
  concept?: string;
}

export interface GetDistributionsResponse {
  items: Distribution[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetDistributionsParams {
  filters?: { value?: string };
  page?: number;
  sort?: SortParam[];
  size?: number;
  status?: ProcessStatus;
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

export interface Holder {
  id: string;
  batchPayout: {
    id: string;
    distribution: Distribution;
    hederaTransactionId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    hederaTransactionAddress?: string;
  };
  amount: string;
  holderHederaAddress: string;
  holderEvmAddress: string;
  retryCounter: number;
  status: "PENDING" | "RETRYING" | "SUCCESS" | "FAILED";
  lastError: string | null;
  nextRetryAt: Date | null;
  updatedAt: string;
}

export interface GetHoldersParams {
  distributionId: string;
  page?: number;
  size?: number;
  search?: string;
}

export class DistributionService {
  static async getDistributions(params: GetDistributionsParams = {}): Promise<PaginatedResponse<Distribution>> {
    const { filters, page = 0, sort = [], size = 10, status } = params;

    const query = new URLSearchParams();
    filters?.value && query.append("search", filters.value);
    query.append("page", (page + 1).toString()); // Backend expects 1-based
    query.append("limit", size.toString());
    status && query.append("status", status);

    if (sort.length > 0) {
      const firstSort = sort[0];
      query.append("orderBy", firstSort.id);
      query.append("order", firstSort.desc ? "DESC" : "ASC");
    }

    const url = buildUrl(BackendUrls.GetDistributions, {});
    const response = await apiRequest<{
      items: Distribution[];
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

  static async getDistribution(distributionId: string): Promise<Distribution> {
    const url = buildUrl(BackendUrls.GetDistribution, { distributionId });
    return apiRequest<Distribution>(url, {
      method: "GET",
    });
  }

  static async getDistributionHolders(params: GetHoldersParams): Promise<PaginatedResponse<Holder>> {
    const { distributionId, page = 0, size = 10, search } = params;

    const query = new URLSearchParams();
    search && query.append("search", search);
    query.append("page", (page + 1).toString()); // Backend expects 1-based
    query.append("limit", size.toString());

    const url = buildUrl(BackendUrls.GetDistributionHolders, {
      distributionId,
    });
    const response = await apiRequest<{
      items: Holder[];
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

  static async cancelDistribution(distributionId: string): Promise<void> {
    const url = buildUrl(BackendUrls.CancelDistribution, { distributionId });
    return apiRequest<void>(url, {
      method: "PATCH",
    });
  }

  static async retryDistribution(distributionId: string): Promise<void> {
    const url = buildUrl(BackendUrls.RetryDistribution, { distributionId });
    return apiRequest<void>(url, {
      method: "PATCH",
    });
  }
}
