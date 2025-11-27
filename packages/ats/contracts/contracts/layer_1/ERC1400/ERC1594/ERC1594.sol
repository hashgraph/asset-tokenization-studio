// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ISSUER_ROLE, _AGENT_ROLE } from "../../constants/roles.sol";
import { IERC1594 } from "../../interfaces/ERC1400/IERC1594.sol";
import { Common } from "../../common/Common.sol";
import { _DEFAULT_PARTITION } from "../../../layer_0/constants/values.sol";

abstract contract ERC1594 is IERC1594, Common {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1594() external override onlyUninitialized(_erc1594Storage().initialized) {
        super._initialize_ERC1594();
    }

    function transferWithData(
        address _to,
        uint256 _value,
        bytes calldata /*_data*/
    )
        external
        override
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(_msgSender(), _to, _DEFAULT_PARTITION, _value, "", "")
    {
        // Add a function to validate the `_data` parameter
        _transfer(_msgSender(), _to, _value);
    }

    function transferFromWithData(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata /*_data*/
    )
        external
        override
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanTransferFromByPartition(_from, _to, _DEFAULT_PARTITION, _value, "", "")
    {
        {
            _checkRecoveredAddress(_msgSender());
            _checkRecoveredAddress(_to);
            _checkRecoveredAddress(_from);
        }
        // Add a function to validate the `_data` parameter
        _transferFrom(_msgSender(), _from, _to, _value);
    }

    function issue(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data
    )
        external
        override
        onlyWithoutMultiPartition
        onlyWithinMaxSupply(_value)
        onlyIdentified(address(0), _tokenHolder)
        onlyCompliant(address(0), _tokenHolder, false)
        onlyIssuable
        onlyUnpaused
    {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _ISSUER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        _issue(_tokenHolder, _value, _data);
    }

    function redeem(
        uint256 _value,
        bytes memory _data
    )
        external
        override
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanRedeemFromByPartition(_msgSender(), _DEFAULT_PARTITION, _value, _data, "")
    {
        _redeem(_value, _data);
    }

    function redeemFrom(
        address _tokenHolder,
        uint256 _value,
        bytes memory _data
    )
        external
        override
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        onlyCanRedeemFromByPartition(_tokenHolder, _DEFAULT_PARTITION, _value, _data, "")
        onlyUnrecoveredAddress(_msgSender())
        onlyUnrecoveredAddress(_tokenHolder)
    {
        _redeemFrom(_tokenHolder, _value, _data);
    }

    function isIssuable() external view override returns (bool) {
        return _isIssuable();
    }

    function canTransfer(
        address _to,
        uint256 _value,
        bytes memory _data
    ) external view override onlyWithoutMultiPartition returns (bool, bytes1, bytes32) {
        (bool status, bytes1 statusCode, bytes32 reason, ) = _isAbleToTransferFromByPartition(
            _msgSender(),
            _to,
            _DEFAULT_PARTITION,
            _value,
            _data,
            ""
        );
        return (status, statusCode, reason);
    }

    function canTransferFrom(
        address _from,
        address _to,
        uint256 _value,
        bytes memory _data
    ) external view onlyWithoutMultiPartition returns (bool, bytes1, bytes32) {
        (bool status, bytes1 statusCode, bytes32 reason, ) = _isAbleToTransferFromByPartition(
            _from,
            _to,
            _DEFAULT_PARTITION,
            _value,
            _data,
            ""
        );
        return (status, statusCode, reason);
    }
}
