// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../interfaces/IERC1410TokenHolder.sol";
import "../storage/ERC1410Storage.sol";

// LOOK AT THESE IMPORTS - Crystal clear dependencies!
import "./lib/LibPause.sol";
import "./lib/LibCompliance.sol";
import "./lib/LibPartition.sol";
import "./lib/LibERC1410Transfer.sol";
import "./lib/LibERC1410Operator.sol";

/**
 * NEW ARCHITECTURE - ERC1410TokenHolderFacet
 *
 * ✅ EXPLICIT IMPORTS: This facet imports ONLY what it uses:
 *    - LibPause (for pause checking)
 *    - LibCompliance (for compliance checking)
 *    - LibPartition (for partition validation)
 *    - LibERC1410Transfer (for transfer/redeem)
 *    - LibERC1410Operator (for operator management)
 *
 * ❌ NOT IMPORTED (and therefore NOT in bytecode):
 *    - LibFreeze (freezing logic)
 *    - LibLock (locking logic)
 *    - LibHold (hold logic)
 *    - LibClearing (clearing logic)
 *    - LibCoupon (coupon logic)
 *    - LibDividend (dividend logic)
 *    - LibSnapshot (snapshot logic)
 *    - LibVoting (voting logic)
 *    - ... all the other libraries this facet doesn't need
 *
 * RESULT:
 * - Same functionality ✅
 * - Same gas cost ✅ (internal libs are inlined)
 * - Clear dependencies ✅
 * - Easy to audit ✅
 */
contract NewERC1410TokenHolderFacet is IERC1410TokenHolder {

    function transferByPartition(
        bytes32 _partition,
        BasicTransferInfo calldata _basicTransferInfo,
        bytes memory _data
    ) external override returns (bytes32) {
        // Explicit checks - no hidden modifiers!
        LibPartition.requireUnprotectedOrWildcard();
        LibPartition.requireValidPartition(_partition);

        return LibERC1410Transfer.transferByPartition(
            msg.sender,
            _basicTransferInfo,
            _partition,
            _data,
            address(0),
            ""
        );
    }

    function redeemByPartition(
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data
    ) external override {
        // Explicit checks
        LibPartition.requireValidPartition(_partition);
        LibPartition.requireUnprotectedOrWildcard();

        LibERC1410Transfer.redeemByPartition(
            _partition,
            msg.sender,
            address(0),
            _value,
            _data,
            ""
        );
    }

    function authorizeOperator(address _operator) external override {
        // Explicit checks
        LibPause.requireNotPaused();
        LibCompliance.checkCompliance(msg.sender, _operator);

        LibERC1410Operator.authorizeOperator(_operator);
    }

    function revokeOperator(address _operator) external override {
        // Explicit checks
        LibPause.requireNotPaused();
        LibCompliance.checkCompliance(msg.sender, address(0));

        LibERC1410Operator.revokeOperator(_operator);
    }

    function authorizeOperatorByPartition(bytes32 _partition, address _operator) external override {
        // Explicit checks
        LibPause.requireNotPaused();
        LibPartition.requireValidPartition(_partition);
        LibCompliance.checkCompliance(msg.sender, _operator);

        LibERC1410Operator.authorizeOperatorByPartition(_partition, _operator);
    }

    function revokeOperatorByPartition(bytes32 _partition, address _operator) external override {
        // Explicit checks
        LibPause.requireNotPaused();
        LibPartition.requireValidPartition(_partition);
        LibCompliance.checkCompliance(msg.sender, address(0));

        LibERC1410Operator.revokeOperatorByPartition(_partition, _operator);
    }

    function isOperator(address _operator, address _tokenHolder) external view override returns (bool) {
        return LibERC1410Operator.isOperator(_operator, _tokenHolder);
    }

    function isOperatorForPartition(bytes32 _partition, address _operator, address _tokenHolder) external view override returns (bool) {
        return LibERC1410Operator.isOperatorForPartition(_partition, _operator, _tokenHolder);
    }
}
