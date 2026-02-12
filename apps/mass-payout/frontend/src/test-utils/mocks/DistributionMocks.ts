// SPDX-License-Identifier: Apache-2.0

/**
 * Mock distribution data for testing
 */
export interface MockDistribution {
  id: string;
  asset: {
    id: string;
    name: string;
    type: string;
    hederaTokenAddress: string;
    evmTokenAddress: string;
    lifeCycleCashFlowHederaAddress: string;
    lifeCycleCashFlowEvmAddress: string;
    isPaused: boolean;
    createdAt: string;
    updatedAt: string;
  };
  corporateActionID: string | null;
  executionDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  batchCount?: number;
  holders?: number;
  progress?: number;
}

/**
 * Mock distributions with realistic test data
 */
export const mockDistributions: MockDistribution[] = [
  {
    id: "650e8400-e29b-41d4-a716-446655440001",
    asset: {
      id: "0.0.123456",
      name: "Hedera Treasury Bond 2025",
      type: "Bond Variable Rate",
      hederaTokenAddress: "0.0.123456",
      evmTokenAddress: "0x1234567890123456789012345678901234567890",
      lifeCycleCashFlowHederaAddress: "0.0.789012",
      lifeCycleCashFlowEvmAddress: "0x7890123456789012345678901234567890123456",
      isPaused: false,
      createdAt: "2024-10-06T10:30:00Z",
      updatedAt: "2024-10-06T10:30:00Z",
    },
    corporateActionID: "CA-001",
    executionDate: "2024-10-06T10:00:00Z",
    status: "In Progress",
    createdAt: "2024-10-06T08:00:00Z",
    updatedAt: "2024-10-06T10:30:00Z",
    batchCount: 50,
    holders: 90,
    progress: 75,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440002",
    asset: {
      id: "0.0.234567",
      name: "DLT Infrastructure Equity Fund",
      type: "Equity",
      hederaTokenAddress: "0.0.234567",
      evmTokenAddress: "0x2345678901234567890123456789012345678901",
      lifeCycleCashFlowHederaAddress: "0.0.890123",
      lifeCycleCashFlowEvmAddress: "0x8901234567890123456789012345678901234567",
      isPaused: false,
      createdAt: "2024-10-05T10:30:00Z",
      updatedAt: "2024-10-05T10:30:00Z",
    },
    corporateActionID: "CA-002",
    executionDate: "2024-10-05T10:00:00Z",
    status: "Completed",
    createdAt: "2024-10-05T08:00:00Z",
    updatedAt: "2024-10-05T12:00:00Z",
    batchCount: 50,
    holders: 90,
    progress: 100,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440003",
    asset: {
      id: "0.0.345678",
      name: "Consensus Node Validator Shares",
      type: "Equity",
      hederaTokenAddress: "0.0.345678",
      evmTokenAddress: "0x3456789012345678901234567890123456789012",
      lifeCycleCashFlowHederaAddress: "0.0.901234",
      lifeCycleCashFlowEvmAddress: "0x9012345678901234567890123456789012345678",
      isPaused: true,
      createdAt: "2024-10-04T10:30:00Z",
      updatedAt: "2024-10-04T10:30:00Z",
    },
    corporateActionID: "CA-003",
    executionDate: "2024-10-04T10:00:00Z",
    status: "Failed",
    createdAt: "2024-10-04T08:00:00Z",
    updatedAt: "2024-10-04T11:00:00Z",
    batchCount: 50,
    holders: 90,
    progress: 25,
  },
  {
    id: "650e8400-e29b-41d4-a716-446655440004",
    asset: {
      id: "0.0.456789",
      name: "Mirror Node Network Equity",
      type: "Equity",
      hederaTokenAddress: "0.0.456789",
      evmTokenAddress: "0x4567890123456789012345678901234567890123",
      lifeCycleCashFlowHederaAddress: "0.0.012345",
      lifeCycleCashFlowEvmAddress: "0x0123456789012345678901234567890123456789",
      isPaused: false,
      createdAt: "2024-10-03T10:30:00Z",
      updatedAt: "2024-10-03T10:30:00Z",
    },
    corporateActionID: null, // Manual distribution
    executionDate: "2024-10-03T10:00:00Z",
    status: "In Progress",
    createdAt: "2024-10-03T08:00:00Z",
    updatedAt: "2024-10-03T10:30:00Z",
    batchCount: 50,
    holders: 90,
    progress: 60,
  },
];

/**
 * Mock paginated response for distributions
 */
export const mockDistributionsPaginatedResponse = {
  queryData: mockDistributions,
  page: {
    totalElements: mockDistributions.length,
    totalPages: 1,
    pageIndex: 0,
    pageSize: 10,
  },
};

/**
 * Mock AssetService methods for distributions
 */
export const mockAssetDistributionService = {
  getAssetDistributions: jest.fn().mockResolvedValue(mockDistributionsPaginatedResponse),
};

/**
 * Mock DistributionService methods
 */
export const mockDistributionService = {
  getDistributions: jest.fn().mockResolvedValue(mockDistributionsPaginatedResponse),
  getDistribution: jest.fn().mockResolvedValue(mockDistributions[0]),
};

/**
 * Utility function to create a custom mock distribution with overrides
 */
export const createMockDistribution = (overrides: Partial<MockDistribution> = {}): MockDistribution => ({
  ...mockDistributions[0],
  ...overrides,
});

/**
 * Utility function to create multiple mock distributions
 */
export const createMockDistributions = (
  count: number,
  baseOverrides: Partial<MockDistribution> = {},
): MockDistribution[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockDistribution({
      ...baseOverrides,
      id: `650e8400-e29b-41d4-a716-44665544000${index + 1}`,
      asset: {
        ...mockDistributions[0].asset,
        id: `0.0.${123456 + index}`,
        name: `Test Distribution Asset ${index + 1}`,
      },
    }),
  );
};

/**
 * Reset all distribution mocks to their initial state
 */
export const resetDistributionMocks = (): void => {
  Object.values(mockAssetDistributionService).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });

  Object.values(mockDistributionService).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
};
