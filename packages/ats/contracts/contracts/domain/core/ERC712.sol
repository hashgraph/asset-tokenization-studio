// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// ERC712 library wrapping the free functions from infrastructure/utils/ERC712Lib.sol.
// The actual cryptographic operations remain as free functions in ERC712Lib.sol.
// This library provides domain-aware wrappers that integrate with the storage layer.
//
// NOTE: The ERC712Lib.sol free functions are used directly by ProtectedPartitionsStorageWrapper
// and other libraries. This file is a placeholder for any future ERC712 library-specific
// functionality that may be needed.
//
// The free functions in ERC712Lib.sol already serve as the library pattern:
// - getDomainHash, getMessageHash*, verify, recoverSigner, splitSignature
// - checkNounceAndDeadline, isDeadlineValid, isNounceValid
//
// No additional wrapping is needed at this time since free functions
// are callable from libraries without inheritance.
