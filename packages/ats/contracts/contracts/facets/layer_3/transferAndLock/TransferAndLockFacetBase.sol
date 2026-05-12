// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../infrastructure/proxy/Bytes4Builder.sol";
import { ITransferAndLock } from "./ITransferAndLock.sol";
import { TransferAndLock } from "./TransferAndLock.sol";

abstract contract TransferAndLockFacetBase is TransferAndLock, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.transferAndLock.selector);
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ITransferAndLock).interfaceId);
    }
}
