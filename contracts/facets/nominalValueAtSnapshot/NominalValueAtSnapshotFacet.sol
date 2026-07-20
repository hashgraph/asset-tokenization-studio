// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INominalValueAtSnapshot, RESOLVER_KEY_NOMINAL_VALUE_AT_SNAPSHOT } from "./INominalValueAtSnapshot.sol";
import { NominalValueAtSnapshot } from "./NominalValueAtSnapshot.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title NominalValueAtSnapshotFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes snapshotted nominal-value queries through the
 *         `INominalValueAtSnapshot` interface, registered under
 *         `RESOLVER_KEY_NOMINAL_VALUE_AT_SNAPSHOT`.
 */
contract NominalValueAtSnapshotFacet is NominalValueAtSnapshot, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_NOMINAL_VALUE_AT_SNAPSHOT;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeNominalValueAtSnapshot.selector,
                this.nominalValueAtSnapshot.selector,
                this.nominalValueDecimalsAtSnapshot.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(INominalValueAtSnapshot).interfaceId);
    }
}
