// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _AGENT_ROLE, _TREX_OWNER_ROLE } from "../constants/roles.sol";
import { IERC3643Management } from "../interfaces/ERC3643/IERC3643Management.sol";
import { Common } from "../common/Common.sol";

abstract contract ERC3643Management is IERC3643Management, Common {
    address private constant _ONCHAIN_ID = address(0);

    // ====== External functions (state-changing) ======
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC3643(
        address _compliance,
        address _identityRegistry
    ) external onlyUninitialized(_erc3643Storage().initialized) {
        _initialize_ERC3643(_compliance, _identityRegistry);
    }

    function setName(string calldata _name) external override onlyUnpaused onlyRole(_TREX_OWNER_ROLE) {
        ERC20Storage storage erc20Storage = _setName(_name);

        emit UpdatedTokenInformation(
            erc20Storage.name,
            erc20Storage.symbol,
            erc20Storage.decimals,
            _version(),
            _erc3643Storage().onchainID
        );
    }

    function setSymbol(string calldata _symbol) external override onlyUnpaused onlyRole(_TREX_OWNER_ROLE) {
        ERC20Storage storage erc20Storage = _setSymbol(_symbol);

        emit UpdatedTokenInformation(
            erc20Storage.name,
            erc20Storage.symbol,
            erc20Storage.decimals,
            _version(),
            _erc3643Storage().onchainID
        );
    }

    function setOnchainID(address _onchainID) external override onlyUnpaused onlyRole(_TREX_OWNER_ROLE) {
        ERC20Storage storage erc20Storage = _erc20Storage();
        _erc3643Storage().onchainID = _onchainID;

        emit UpdatedTokenInformation(
            erc20Storage.name,
            erc20Storage.symbol,
            erc20Storage.decimals,
            _version(),
            _onchainID
        );
    }

    function setIdentityRegistry(address _identityRegistry) external override onlyUnpaused onlyRole(_TREX_OWNER_ROLE) {
        _setIdentityRegistry(_identityRegistry);
        emit IdentityRegistryAdded(_identityRegistry);
    }

    function setCompliance(address _compliance) external override onlyUnpaused onlyRole(_TREX_OWNER_ROLE) {
        _setCompliance(_compliance);
    }

    function addAgent(address _agent) external onlyRole(_getRoleAdmin(_AGENT_ROLE)) onlyUnpaused {
        _addAgent(_agent);
        emit AgentAdded(_agent);
    }

    function removeAgent(address _agent) external onlyRole(_getRoleAdmin(_AGENT_ROLE)) onlyUnpaused {
        _removeAgent(_agent);
        emit AgentRemoved(_agent);
    }

    function recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID
    )
        external
        onlyUnrecoveredAddress(_lostWallet)
        onlyRole(_AGENT_ROLE)
        onlyEmptyWallet(_lostWallet)
        onlyWithoutMultiPartition
        returns (bool success_)
    {
        success_ = _recoveryAddress(_lostWallet, _newWallet);
        emit RecoverySuccess(_lostWallet, _newWallet, _investorOnchainID);
    }
}
