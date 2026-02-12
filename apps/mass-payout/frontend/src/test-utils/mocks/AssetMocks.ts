// SPDX-License-Identifier: Apache-2.0

import { Asset, AssetType } from "@/services/AssetService";

/**
 * Centralized mock data for Asset-related tests
 * This provides reusable mock objects that reflect the actual backend structure
 */
export interface BackendMocks {
  asset: Asset;
  assets: Asset[];
  assetService: {
    getAssets: jest.MockedFunction<any>;
    getAsset: jest.MockedFunction<any>;
    pauseAsset: jest.MockedFunction<any>;
    unpauseAsset: jest.MockedFunction<any>;
  };
}

/**
 * Mock asset data that reflects the actual backend Asset interface
 */
export const mockAsset: Asset = {
  id: "0.0.890123",
  name: "Test Asset",
  type: AssetType.EQUITY,
  hederaTokenAddress: "0.0.123456",
  evmTokenAddress: "0x1234567890abcdef1234567890abcdef12345678",
  lifeCycleCashFlowHederaAddress: "0.0.654321",
  lifeCycleCashFlowEvmAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
  isPaused: false,
  syncEnabled: true,
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  symbol: "TEST",
};

/**
 * Mock assets array for testing list scenarios
 */
export const mockAssets: Asset[] = [
  mockAsset,
  {
    id: "0.0.456789",
    name: "Bond Asset",
    type: AssetType.BOND_VARIABLE_RATE,
    hederaTokenAddress: "0.0.789012",
    evmTokenAddress: "0x9876543210fedcba9876543210fedcba98765432",
    lifeCycleCashFlowHederaAddress: "0.0.210987",
    lifeCycleCashFlowEvmAddress: "0xfedcba0987654321fedcba0987654321fedcba09",
    isPaused: true,
    syncEnabled: false,
    createdAt: "2024-01-10T08:15:00Z",
    updatedAt: "2024-01-12T14:45:00Z",
    symbol: "BOND",
  },
];

/**
 * Mock AssetService for testing
 */
export const mockAssetService = {
  getAssets: jest.fn(),
  getAsset: jest.fn(),
  pauseAsset: jest.fn(),
  unpauseAsset: jest.fn(),
};

/**
 * Complete BackendMocks object for easy import
 */
export const backendMocks: BackendMocks = {
  asset: mockAsset,
  assets: mockAssets,
  assetService: mockAssetService,
};

/**
 * Utility function to create a custom mock asset with overrides
 */
export const createMockAsset = (overrides: Partial<Asset> = {}): Asset => ({
  ...mockAsset,
  ...overrides,
});

/**
 * Utility function to create multiple mock assets
 */
export const createMockAssets = (count: number, baseOverrides: Partial<Asset> = {}): Asset[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockAsset({
      ...baseOverrides,
      id: `0.0.${890123 + index}`,
      name: `Test Asset ${index + 1}`,
    }),
  );
};

/**
 * Reset all mocks to their initial state
 */
export const resetAssetMocks = (): void => {
  Object.values(mockAssetService).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
};
