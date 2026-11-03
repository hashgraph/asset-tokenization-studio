// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAsset } from "../../facets/IAsset.sol";
import { IMockDiamondCutHelpers } from "../mocks/MockDiamondCutHelpers.sol";

/// @title IAssetMock
/// @author Asset Tokenization Studio Team
/// @notice Aggregate test-only interface combining the full IAsset facet set with the test
///         mocking interface.
/// @dev Exposes every IAsset function AND the full IMockDiamondCutHelpers surface (all
///      `force*`/`setMultiPartition`/`initializeMockDiamondCutHelpers` controls) under the
///      same proxy. Used by the single test-only BLR configuration (ASSET_MOCK_CONFIG_ID).
interface IAssetMock is IAsset, IMockDiamondCutHelpers {}
