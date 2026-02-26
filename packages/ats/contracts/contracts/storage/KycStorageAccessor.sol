// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _KYC_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IKyc } from "../facets/features/interfaces/IKyc.sol";

/// @dev KYC (Know Your Customer) storage
struct KycStorage {
    mapping(address => IKyc.KycData) kyc;
    mapping(IKyc.KycStatus => EnumerableSet.AddressSet) kycAddressesByStatus;
    bool initialized;
    bool internalKycActivated;
}

/// @dev Access KYC storage
function kycStorage() pure returns (KycStorage storage kyc_) {
    bytes32 pos = _KYC_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        kyc_.slot := pos
    }
}
