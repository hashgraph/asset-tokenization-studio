// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title EvmAccessors
/// @notice Library for EVM context accessors with test override support.
/// @dev Similar pattern to TimeTravelStorageWrapper but for msg.sender, tx.origin, and chainId.
///      In production (non-Hardhat), the override slots are always 0 and native values are returned.
///      Test facets can write to these slots during tests.
/// @author Hashgraph
library EvmAccessors {
    // keccak256('security.token.standard.test.evm.sender')
    bytes32 private constant _SENDER_OVERRIDE_SLOT = 0x6dffada92f87e08031a64f3c82fa9d9b647a47b516130bdc52f646d498adc7f0;

    // keccak256('security.token.standard.test.evm.origin')
    bytes32 private constant _ORIGIN_OVERRIDE_SLOT = 0xda5cca5277b046f39c27835382b41a07ac714748d81f7c159fdbc36744ce094c;

    // keccak256('security.token.standard.test.evm.chainid')
    bytes32 private constant _CHAINID_OVERRIDE_SLOT =
        0x507776cadb568c2dfe62bb4eca625ba1425f245e80c0326444bc9d318035af6c;

    /// @notice Writes a sender override to the well-known slot. Only for test facets.
    /// @param sender The address to use as msg.sender override
    function setSenderOverride(address sender) internal {
        bytes32 slot = _SENDER_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            sstore(slot, sender)
        }
    }

    /// @notice Writes an origin override to the well-known slot. Only for test facets.
    /// @param origin_ The address to use as tx.origin override
    function setOriginOverride(address origin_) internal {
        bytes32 slot = _ORIGIN_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            sstore(slot, origin_)
        }
    }

    /// @notice Writes a chain ID override to the well-known slot. Only for test facets.
    /// @param chainId The chain ID to use as override
    function setChainIdOverride(uint256 chainId) internal {
        bytes32 slot = _CHAINID_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            sstore(slot, chainId)
        }
    }

    /// @notice Returns msg.sender, or the test override if set by test facets.
    /// @return sender_ The effective sender address
    function getMsgSender() internal view returns (address sender_) {
        bytes32 slot = _SENDER_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            sender_ := sload(slot)
        }
        return sender_ == address(0) ? msg.sender : sender_;
    }

    /// @notice Returns tx.origin, or the test override if set by test facets.
    /// @return origin_ The effective origin address
    // solhint-disable-next-line avoid-tx-origin
    function getTxOrigin() internal view returns (address) {
        address originOverride_;
        bytes32 slot = _ORIGIN_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            originOverride_ := sload(slot)
        }
        // solhint-disable-next-line avoid-tx-origin
        return originOverride_ == address(0) ? tx.origin : originOverride_;
    }

    /// @notice Returns block.chainid, or the test override if set by test facets.
    /// @return chainId_ The effective chain ID
    function getChainId() internal view returns (uint256 chainId_) {
        bytes32 slot = _CHAINID_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            chainId_ := sload(slot)
        }
        return chainId_ == 0 ? block.chainid : chainId_;
    }

    /// @notice Returns the raw sender override value (address(0) if not set).
    /// @return sender_ The sender override value
    function getSenderOverride() internal view returns (address sender_) {
        bytes32 slot = _SENDER_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            sender_ := sload(slot)
        }
    }

    /// @notice Returns the raw origin override value (address(0) if not set).
    /// @return origin_ The origin override value
    function getOriginOverride() internal view returns (address origin_) {
        bytes32 slot = _ORIGIN_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            origin_ := sload(slot)
        }
    }

    /// @notice Returns the raw chain ID override value (0 if not set).
    /// @return chainId_ The chain ID override value
    function getChainIdOverride() internal view returns (uint256 chainId_) {
        bytes32 slot = _CHAINID_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            chainId_ := sload(slot)
        }
    }
}
