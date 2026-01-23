// SPDX-License-Identifier: Apache-2.0

// Asset-related mocks
export {
  type BackendMocks,
  mockAsset,
  mockAssets,
  mockAssetService,
  backendMocks,
  createMockAsset,
  createMockAssets,
  resetAssetMocks,
} from "./AssetMocks";

// Future mocks can be added here as the application grows
export * from "./DistributionMocks";
export * from "./PaymentMocks";
