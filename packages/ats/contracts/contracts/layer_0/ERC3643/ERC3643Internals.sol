// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1644Internals } from "../ERC1400/ERC1644/ERC1644Internals.sol";
import { IIdentityRegistry } from "../../layer_1/interfaces/ERC3643/IIdentityRegistry.sol";
import { ICompliance } from "../../layer_1/interfaces/ERC3643/ICompliance.sol";

abstract contract ERC3643Internals is ERC1644Internals {
    function _beforeFreeze(bytes32 _partition, address _tokenHolder) internal virtual;
    function _freezeTokens(address _account, uint256 _amount) internal virtual;
    function _freezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC3643(address _compliance, address _identityRegistry) internal virtual;
    function _recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID
    ) internal virtual returns (bool);
    function _setAddressFrozen(address _userAddress, bool _freezeStatus) internal virtual;
    function _setCompliance(address _compliance) internal virtual;
    function _setIdentityRegistry(address _identityRegistry) internal virtual;
    function _setTotalFreezeLabaf(address _tokenHolder, uint256 _labaf) internal virtual;
    function _setTotalFreezeLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal virtual;
    function _unfreezeTokens(address _account, uint256 _amount) internal virtual;
    function _unfreezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal virtual;
    function _updateAccountFrozenBalancesSnapshot(address account, bytes32 partition) internal virtual;
    function _updateTotalFreeze(bytes32 _partition, address _tokenHolder) internal virtual returns (uint256 abaf_);
    function _updateTotalFreezeAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal virtual;
    function _updateTotalFreezeAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal virtual;
    function _canRecover(address _tokenHolder) internal view virtual returns (bool isEmpty_);
    function _checkRecoveredAddress(address _sender) internal view virtual;
    function _getFrozenAmountFor(address _userAddress) internal view virtual returns (uint256);
    function _getFrozenAmountForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256 amount_);
    function _getFrozenAmountForByPartition(
        bytes32 _partition,
        address _userAddress
    ) internal view virtual returns (uint256);
    function _getFrozenAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view virtual returns (uint256 amount_);
    function _getCompliance() internal view virtual returns (ICompliance);
    function _getIdentityRegistry() internal view virtual returns (IIdentityRegistry);
    function _isERC3643Initialized() internal view virtual returns (bool);
    function _isExternallyAuthorized(address _account) internal view virtual returns (bool);
    function _isRecovered(address _sender) internal view virtual returns (bool);
    function _getTotalFrozenLabaf(address _tokenHolder) internal view virtual returns (uint256 labaf_);
    function _getTotalFrozenLabafByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view virtual returns (uint256 labaf_);
}
