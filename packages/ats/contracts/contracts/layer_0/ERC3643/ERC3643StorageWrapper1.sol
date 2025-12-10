// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_STORAGE_POSITION, _RESOLVER_PROXY_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _AGENT_ROLE } from "../constants/roles.sol";
import { IERC3643Management } from "../../layer_1/interfaces/ERC3643/IERC3643Management.sol";
import { IAccessControl } from "../../layer_1/interfaces/accessControl/IAccessControl.sol";
import { IERC3643StorageWrapper } from "../../layer_1/interfaces/ERC3643/IERC3643StorageWrapper.sol";
import { IIdentityRegistry } from "../../layer_1/interfaces/ERC3643/IIdentityRegistry.sol";
import { ResolverProxyUnstructured } from "../../resolver/resolverProxy/unstructured/ResolverProxyUnstructured.sol";
import { _ERC3643_STORAGE_POSITION, _RESOLVER_PROXY_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { ICompliance } from "../../layer_1/interfaces/ERC3643/ICompliance.sol";
import { LowLevelCall } from "../common/libraries/LowLevelCall.sol";
import { ProceedRecipientsStorageWrapper } from "../proceedRecipients/ProceedRecipientsStorageWrapper.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { _AGENT_ROLE } from "../constants/roles.sol";

abstract contract ERC3643StorageWrapper1 is IERC3643StorageWrapper, ProceedRecipientsStorageWrapper {
    using LowLevelCall for address;

    modifier onlyUnrecoveredAddress(address _account) {
        _checkRecoveredAddress(_account);
        _;
    }

    modifier onlyValidInputAmountsArrayLength(address[] memory _addresses, uint256[] memory _amounts) {
        _checkInputAmountsArrayLength(_addresses, _amounts);
        _;
    }

    modifier onlyValidInputBoolArrayLength(address[] memory _addresses, bool[] memory _status) {
        _checkInputBoolArrayLength(_addresses, _status);
        _;
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC3643(address _compliance, address _identityRegistry) internal {
        IERC3643Management.ERC3643Storage storage eRC3643Storage = _erc3643Storage();
        eRC3643Storage.initialized = true;
        _setCompliance(_compliance);
        _setIdentityRegistry(_identityRegistry);
    }

    function _setAddressFrozen(address _userAddress, bool _freezeStatus) internal override {
        if (_freezeStatus) {
            _getControlListType() ? _removeFromControlList(_userAddress) : _addToControlList(_userAddress);
            return;
        }
        _getControlListType() ? _addToControlList(_userAddress) : _removeFromControlList(_userAddress);
    }

    function _addAgent(address _agent) internal override {
        if (!_grantRole(_AGENT_ROLE, _agent)) {
            revert IAccessControl.AccountAssignedToRole(_AGENT_ROLE, _agent);
        }
    }

    function _removeAgent(address _agent) internal override {
        if (!_revokeRole(_AGENT_ROLE, _agent)) {
            revert IAccessControl.AccountNotAssignedToRole(_AGENT_ROLE, _agent);
        }
    }

    function _setCompliance(address _compliance) internal override {
        _erc3643Storage().compliance = _compliance;
        emit ComplianceAdded(_compliance);
    }

    function _setIdentityRegistry(address _identityRegistry) internal override {
        _erc3643Storage().identityRegistry = _identityRegistry;
    }

    function _getFrozenAmountFor(address _userAddress) internal view override returns (uint256) {
        IERC3643Management.ERC3643Storage storage st = _erc3643Storage();
        return st.frozenTokens[_userAddress];
    }

    function _getFrozenAmountForByPartition(bytes32 _partition, address _userAddress) internal view override returns (uint256) {
        IERC3643Management.ERC3643Storage storage st = _erc3643Storage();
        return st.frozenTokensByPartition[_userAddress][_partition];
    }

    function _checkRecoveredAddress(address _sender) internal view override {
        if (_isRecovered(_sender)) revert IERC3643Management.WalletRecovered();
    }

    function _isRecovered(address _sender) internal view override returns (bool) {
        return _erc3643Storage().addressRecovered[_sender];
    }

    function _version() internal view returns (string memory) {
        return
            // solhint-disable quotes
            string(
                abi.encodePacked(
                    "{",
                    '"Resolver": "',
                    Strings.toHexString(uint160(address(_resolverProxyStorage().resolver)), 20),
                    '", ',
                    '"Config ID": "',
                    Strings.toHexString(uint256(_resolverProxyStorage().resolverProxyConfigurationId), 32),
                    '", ',
                    '"Version": "',
                    Strings.toString(_resolverProxyStorage().version),
                    '"',
                    "}"
                )
            );
        // solhint-enable quotes
    }

    function _getCompliance() internal view returns (ICompliance) {
        return ICompliance(_erc3643Storage().compliance);
    }

    function _getIdentityRegistry() internal view returns (IIdentityRegistry) {
        return IIdentityRegistry(_erc3643Storage().identityRegistry);
    }

    function _getOnchainID() internal view returns (address) {
        return _erc3643Storage().onchainID;
    }

    function _checkInputAmountsArrayLength(address[] memory _addresses, uint256[] memory _amounts) internal pure {
        if (_addresses.length != _amounts.length) {
            revert IERC3643Management.InputAmountsArrayLengthMismatch();
        }
    }

    function _checkInputBoolArrayLength(address[] memory _addresses, bool[] memory _status) internal pure {
        if (_addresses.length != _status.length) {
            revert IERC3643Management.InputBoolArrayLengthMismatch();
        }
    }

    function _erc3643Storage() internal pure returns (IERC3643Management.ERC3643Storage storage erc3643Storage_) {
        bytes32 position = _ERC3643_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc3643Storage_.slot := position
        }
    }

    /**
     * @dev This belongs to the ResolverProxyUnstructured contract.
     * Since it is not in the common inheritance chain we redeclare it here
     */
    function _resolverProxyStorage() internal pure returns (ResolverProxyUnstructured.ResolverProxyStorage storage ds) {
        bytes32 position = _RESOLVER_PROXY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }
}
