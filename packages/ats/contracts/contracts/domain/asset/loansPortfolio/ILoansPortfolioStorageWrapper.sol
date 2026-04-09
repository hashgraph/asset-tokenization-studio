// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ILoansPortfolioStorageWrapper {
    error HoldingsAssetAlreadyExists(address assetAddress);
    error HoldingAssetNotFound(address assetAddress);
    error HoldingsAssetTypeNotSupported(uint8 holdingsAssetType);
}
