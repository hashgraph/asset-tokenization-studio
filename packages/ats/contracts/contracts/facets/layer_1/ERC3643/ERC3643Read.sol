// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _AGENT_ROLE } from "../../../constants/roles.sol";
import { IERC3643Read } from "./IERC3643Read.sol";
import { ICompliance } from "./ICompliance.sol";
import { IIdentityRegistry } from "./IIdentityRegistry.sol";
import { Internals } from "../../../domain/Internals.sol";

abstract contract ERC3643Read is IERC3643Read, Internals {
    function isAgent(address _agent) external view returns (bool) {
        return _hasRole(_AGENT_ROLE, _agent);
    }

    function identityRegistry() external view override returns (IIdentityRegistry) {
        return _getIdentityRegistry();
    }

    function onchainID() external view override returns (address) {
        return _getOnchainID();
    }

    function compliance() external view override returns (ICompliance) {
        return _getCompliance();
    }

    function isAddressRecovered(address _wallet) external view returns (bool) {
        return _isRecovered(_wallet);
    }

    function version() external view returns (string memory) {
        return _version();
    }
}
