// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410OperatorInternals } from "../ERC1410/ERC1410OperatorInternals.sol";

abstract contract ERC1594Internals is ERC1410OperatorInternals {
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC1594() internal virtual;
    function _redeem(uint256 _value, bytes memory _data) internal virtual;
    function _redeemByPartition(
        bytes32 _partition,
        address _from,
        address _operator,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) internal virtual;
    function _redeemFrom(address _tokenHolder, uint256 _value, bytes memory _data) internal virtual;
    function _checkCanRedeemFromByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes memory,
        bytes memory
    ) internal view virtual;
    function _checkCanTransferFromByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    ) internal view virtual;
    function _checkCompliance(address _from, address _to, bool _checkSender) internal view virtual;
    function _checkIdentity(address _from, address _to) internal view virtual;
    function _isAbleToRedeemFromByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    )
        internal
        view
        virtual
        returns (bool isAbleToRedeemFrom, bytes1 statusCode, bytes32 reasonCode, bytes memory details);
    function _isAbleToTransferFromByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes memory /*_data*/,
        bytes memory /*_operatorData*/
    )
        internal
        view
        virtual
        returns (bool isAbleToTransfer, bytes1 statusCode, bytes32 reasonCode, bytes memory details);
    function _isERC1594Initialized() internal view virtual returns (bool);
}
