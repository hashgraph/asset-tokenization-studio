// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _AGENT_ROLE } from "../../../constants/roles.sol";
import { IERC3643Read } from "../interfaces/ERC3643/IERC3643Read.sol";
import { ICompliance } from "../interfaces/ERC3643/ICompliance.sol";
import { IIdentityRegistry } from "../interfaces/ERC3643/IIdentityRegistry.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibCompliance } from "../../../lib/core/LibCompliance.sol";
import { LibResolverProxy } from "../../../infrastructure/proxy/LibResolverProxy.sol";

abstract contract ERC3643Read is IERC3643Read {
    // ═══════════════════════════════════════════════════════════════════════════════
    // EXTERNAL VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function isAgent(address _agent) external view returns (bool) {
        return LibAccess.hasRole(_AGENT_ROLE, _agent);
    }

    function identityRegistry() external view override returns (IIdentityRegistry) {
        return LibCompliance.getIdentityRegistry();
    }

    function onchainID() external view override returns (address) {
        return LibCompliance.getOnchainID();
    }

    function compliance() external view override returns (ICompliance) {
        return LibCompliance.getCompliance();
    }

    function isAddressRecovered(address _wallet) external view returns (bool) {
        return LibCompliance.isRecovered(_wallet);
    }

    function version() external view returns (string memory) {
        return LibResolverProxy.version();
    }
}
