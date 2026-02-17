// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingModifiers } from "../../clearing/ClearingModifiers.sol";

abstract contract ERC1594Modifiers is ClearingModifiers {
    // ===== ERC1594 Modifiers =====
    modifier onlyIdentified(address _from, address _to) virtual;
    modifier onlyCompliant(address _from, address _to, bool _checkSender) virtual;
    modifier onlyCanTransferFromByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes memory,
        bytes memory
    ) virtual;
    modifier onlyCanRedeemFromByPartition(address _from, bytes32 _partition, uint256 _value, bytes memory, bytes memory)
        virtual;
    modifier onlyWithoutMultiPartition() virtual;
}
