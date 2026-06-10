// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import { IAsset } from "../../facets/IAsset.sol";
import { IMockDiamondCut } from "../mocks/MockDiamondCut.sol";

/// @title IAssetMock
/// @author Asset Tokenization Studio Team
/// @notice Aggregate test-only interface combining the full IAsset facet set with the test
///         mocking interface.
/// @dev Exposes every IAsset function AND MockDiamondCut's forceNonOperational /
///      forceFacetNotRegistered controls under the same proxy. Used by the single test-only
///      BLR configuration (ASSET_MOCK_CONFIG_ID).
interface IAssetMock is IAsset, IMockDiamondCut {}
