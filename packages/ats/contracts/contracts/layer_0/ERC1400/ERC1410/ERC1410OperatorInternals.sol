// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410Internals } from "./ERC1410Internals.sol";
import { OperatorTransferData } from "../../../layer_1/interfaces/ERC1400/IERC1410.sol";

abstract contract ERC1410OperatorInternals is ERC1410Internals {
    function _authorizeOperator(address _operator) internal virtual;
    function _authorizeOperatorByPartition(bytes32 _partition, address _operator) internal virtual;
    function _operatorTransferByPartition(
        OperatorTransferData calldata _operatorTransferData
    ) internal virtual returns (bytes32);
    function _revokeOperator(address _operator) internal virtual;
    function _revokeOperatorByPartition(bytes32 _partition, address _operator) internal virtual;
    function _checkOperator(bytes32 _partition, address _from) internal view virtual;
    function _isAuthorized(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) internal view virtual returns (bool);
    function _isOperator(address _operator, address _tokenHolder) internal view virtual returns (bool);
    function _isOperatorForPartition(
        bytes32 _partition,
        address _operator,
        address _tokenHolder
    ) internal view virtual returns (bool);
}
