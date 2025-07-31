// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    ERC1410StandardStorageWrapper
} from './ERC1410StandardStorageWrapper.sol';
import {
    ERC1410ProtectedPartitionsStorageWrapper
} from './ERC1410ProtectedPartitionsStorageWrapper.sol';

// solhint-disable no-empty-blocks
abstract contract ERC1410StorageWrapper is
    ERC1410StandardStorageWrapper,
    ERC1410ProtectedPartitionsStorageWrapper
{}
