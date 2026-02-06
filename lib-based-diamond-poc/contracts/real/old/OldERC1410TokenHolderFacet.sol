// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../interfaces/IERC1410TokenHolder.sol";
import "./Internals.sol";

/**
 * OLD ARCHITECTURE - ERC1410TokenHolderFacet
 *
 * This facet inherits the ENTIRE Internals monster.
 *
 * PROBLEM: This facet only uses 10 functions from Internals:
 * - _checkUnpaused (via modifier)
 * - _checkCompliance (via modifier)
 * - _checkUnProtectedPartitionsOrWildCardRole (via modifier)
 * - _checkDefaultPartitionWithSinglePartition (via modifier)
 * - _transferByPartition
 * - _redeemByPartition
 * - _authorizeOperator
 * - _revokeOperator
 * - _authorizeOperatorByPartition
 * - _revokeOperatorByPartition
 *
 * But it COMPILES IN everything else:
 * - All freeze functions
 * - All lock functions
 * - All hold functions
 * - All clearing functions
 * - All coupon functions
 * - All dividend functions
 * - All snapshot functions
 * - All voting functions
 * - ... 1400+ unused functions
 */
contract OldERC1410TokenHolderFacet is IERC1410TokenHolder, Internals {

    function transferByPartition(
        bytes32 _partition,
        BasicTransferInfo calldata _basicTransferInfo,
        bytes memory _data
    )
        external
        override
        onlyUnProtectedPartitionsOrWildCardRole
        onlyDefaultPartitionWithSinglePartition(_partition)
        returns (bytes32)
    {
        return _transferByPartition(msg.sender, _basicTransferInfo, _partition, _data, address(0), "");
    }

    function redeemByPartition(
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnProtectedPartitionsOrWildCardRole
    {
        _redeemByPartition(_partition, msg.sender, address(0), _value, _data, "");
    }

    function authorizeOperator(
        address _operator
    ) external override onlyUnpaused onlyCompliant(msg.sender, _operator) {
        _authorizeOperator(_operator);
    }

    function revokeOperator(
        address _operator
    ) external override onlyUnpaused onlyCompliant(msg.sender, address(0)) {
        _revokeOperator(_operator);
    }

    function authorizeOperatorByPartition(
        bytes32 _partition,
        address _operator
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyCompliant(msg.sender, _operator)
    {
        _authorizeOperatorByPartition(_partition, _operator);
    }

    function revokeOperatorByPartition(
        bytes32 _partition,
        address _operator
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyCompliant(msg.sender, address(0))
    {
        _revokeOperatorByPartition(_partition, _operator);
    }

    function isOperator(address _operator, address _tokenHolder) external view override returns (bool) {
        return _isOperator(_operator, _tokenHolder);
    }

    function isOperatorForPartition(bytes32 _partition, address _operator, address _tokenHolder) external view override returns (bool) {
        return _isOperatorForPartition(_partition, _operator, _tokenHolder);
    }
}
