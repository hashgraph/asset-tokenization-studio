// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _AGENT_ROLE } from "../../../constants/roles.sol";
import { IERC3643Read } from "../ERC3643/IERC3643Read.sol";
import { ICompliance } from "../ERC3643/ICompliance.sol";
import { IIdentityRegistry } from "../ERC3643/IIdentityRegistry.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { ComplianceStorageWrapper } from "../../../domain/core/ComplianceStorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "../../../infrastructure/proxy/ResolverProxyStorageWrapper.sol";

abstract contract ERC3643Read is IERC3643Read {
    // ═══════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function isAgent(address _agent) external view returns (bool) {
        return AccessStorageWrapper.hasRole(_AGENT_ROLE, _agent);
    }

    function identityRegistry() external view override returns (IIdentityRegistry) {
        return ComplianceStorageWrapper.getIdentityRegistry();
    }

    function onchainID() external view override returns (address) {
        return ComplianceStorageWrapper.getOnchainID();
    }

    function compliance() external view override returns (ICompliance) {
        return ComplianceStorageWrapper.getCompliance();
    }

    function isAddressRecovered(address _wallet) external view returns (bool) {
        return ComplianceStorageWrapper.isRecovered(_wallet);
    }

    function version() external view returns (string memory) {
        return ResolverProxyStorageWrapper.version();
    }
}
