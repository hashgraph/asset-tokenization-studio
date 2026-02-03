// SPDX-License-Identifier: Apache-2.0

import { Asset } from "../services/AssetService";

export enum AssetStatus {
  ACTIVE = "detail.status.active",
  PAUSED = "detail.status.paused",
  COMPLETED = "detail.status.completed",
  SCHEDULED = "detail.status.scheduled",
  IN_PROGRESS = "detail.status.inProgress",
  FAILED = "detail.status.failed",
}

export interface AssetData {
  assetType: string;
  name: string;
  assetId: string;
  lifecycleCashFlowId: string;
  maturityDate?: string;
  symbol: string;
  status: AssetStatus;
}

export const transformAssetToAssetData = (asset: Asset): AssetData => ({
  assetType: asset.type,
  name: asset.name,
  assetId: asset.id,
  lifecycleCashFlowId: asset.lifeCycleCashFlowHederaAddress || asset.lifeCycleCashFlowEvmAddress || "",
  maturityDate: asset.maturityDate,
  symbol: asset.symbol,
  status: asset.isPaused ? AssetStatus.PAUSED : AssetStatus.ACTIVE,
});
