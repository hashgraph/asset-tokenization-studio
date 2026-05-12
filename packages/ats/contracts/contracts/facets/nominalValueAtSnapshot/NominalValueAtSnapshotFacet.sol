// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INominalValueAtSnapshot } from "./INominalValueAtSnapshot.sol";
import { NominalValueAtSnapshot } from "./NominalValueAtSnapshot.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _NOMINAL_VALUE_AT_SNAPSHOT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title NominalValueAtSnapshotFacet
 */
contract NominalValueAtSnapshotFacet is NominalValueAtSnapshot, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _NOMINAL_VALUE_AT_SNAPSHOT_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[0] = this.nominalValueAtSnapshot.selector;
        staticFunctionSelectors_[1] = this.nominalValueDecimalsAtSnapshot.selector;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(INominalValueAtSnapshot).interfaceId;
    }
}
