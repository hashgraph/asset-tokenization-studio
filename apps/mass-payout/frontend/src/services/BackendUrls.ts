// SPDX-License-Identifier: Apache-2.0

export enum BackendUrls {
  // AssetService
  GetAssets = "/assets",
  GetAsset = "/assets/:assetId",
  GetAssetMetadata = "/assets/:hederaTokenAddress/metadata",
  ImportAsset = "/assets/import",
  PauseAsset = "/assets/:assetId/pause",
  UnpauseAsset = "/assets/:assetId/unpause",
  EnableAssetSync = "/assets/:assetId/enable-sync",
  DisableAssetSync = "/assets/:assetId/disable-sync",
  GetAssetDistributions = "/assets/:assetId/distributions",
  CreateManualPayout = "/assets/:assetId/distributions/payout",

  // DistributionService
  GetDistributions = "/distributions",
  GetDistribution = "/distributions/:distributionId",
  GetDistributionHolders = "/distributions/:distributionId/holders",
  CancelDistribution = "/distributions/:distributionId/cancel",
  RetryDistribution = "/distributions/:distributionId/retry",
}
