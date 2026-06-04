// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { IEvmAccessorsFacet, RESOLVER_KEY_EVM_ACCESSORS } from "./IEvmAccessorsFacet.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";

/**
 * @title EvmAccessorsFacet
 * @author Asset Tokenization Studio Team
 * @notice Test-only writer facet that drives the EvmAccessors override slots. Only
 *         compiled when `ATS_TEST_MODE=true`; the prod compile path excludes the
 *         entire `contracts/test/testAccessors/` directory through the
 *         `TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS` subtask in `tasks/compile.ts`.
 *
 *         Drives the override slot for every accessor the library models —
 *         `block.timestamp`, `block.number`, `msg.sender` and `block.chainid`. The
 *         `msg.sender` override is global storage that applies to every read on the
 *         diamond; prefer Hardhat impersonation / `signer.connect()` for ordinary
 *         per-call sender control and reserve `changeSystemSender` for the rare case
 *         a library-layer read must see a synthetic caller.
 */
contract EvmAccessorsFacet is IStaticFunctionSelectors, IEvmAccessorsFacet, Modifiers {
    /**
     * @notice Reverts when a zero block number override is supplied.
     * @param _blockNumber The candidate block number override.
     */
    modifier onlyValidBlockNumber(uint256 _blockNumber) {
        _checkBlockNumber(_blockNumber);
        _;
    }

    /**
     * @notice Reverts when a zero chain id override is supplied.
     * @param _chainId The candidate chain id override.
     */
    modifier onlyValidChainId(uint256 _chainId) {
        _checkChainId(_chainId);
        _;
    }

    /**
     * @notice Reverts when the zero address (the override sentinel) is supplied.
     * @param _sender The candidate sender override.
     */
    modifier onlyValidSender(address _sender) {
        _checkSender(_sender);
        _;
    }

    /// @inheritdoc IEvmAccessorsFacet
    function initializeEvmAccessors() external override onlyFacetNotRegistered(RESOLVER_KEY_EVM_ACCESSORS) {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_EVM_ACCESSORS);
        emit EvmAccessorsInitialized();
    }

    /// @inheritdoc IEvmAccessorsFacet
    function changeSystemTimestamp(uint256 _newSystemTime) external override onlyValidTimestamp(_newSystemTime) {
        uint256 oldTimestamp = EvmAccessors.getBlockTimestampOverride();
        EvmAccessors.setBlockTimestampOverride(_newSystemTime);
        emit SystemTimestampChanged(oldTimestamp, _newSystemTime);
    }

    /// @inheritdoc IEvmAccessorsFacet
    function resetSystemTimestamp() external override {
        EvmAccessors.setBlockTimestampOverride(0);
        emit SystemTimestampReset();
    }

    /// @inheritdoc IEvmAccessorsFacet
    function changeSystemBlockNumber(
        uint256 _newSystemBlockNumber
    ) external override onlyValidBlockNumber(_newSystemBlockNumber) {
        uint256 oldBlockNumber = EvmAccessors.getBlockNumberOverride();
        EvmAccessors.setBlockNumberOverride(_newSystemBlockNumber);
        emit SystemBlockNumberChanged(oldBlockNumber, _newSystemBlockNumber);
    }

    /// @inheritdoc IEvmAccessorsFacet
    function resetSystemBlockNumber() external override {
        EvmAccessors.setBlockNumberOverride(0);
        emit SystemBlockNumberReset();
    }

    /// @inheritdoc IEvmAccessorsFacet
    function changeSystemChainId(uint256 _newChainId) external override onlyValidChainId(_newChainId) {
        uint256 oldChainId = EvmAccessors.getChainIdOverride();
        EvmAccessors.setChainIdOverride(_newChainId);
        emit SystemChainIdChanged(oldChainId, _newChainId);
    }

    /// @inheritdoc IEvmAccessorsFacet
    function resetSystemChainId() external override {
        EvmAccessors.setChainIdOverride(0);
        emit SystemChainIdReset();
    }

    /// @inheritdoc IEvmAccessorsFacet
    function changeSystemSender(address _newSender) external override onlyValidSender(_newSender) {
        address oldSender = EvmAccessors.getMsgSenderOverride();
        EvmAccessors.setMsgSenderOverride(_newSender);
        emit SystemSenderChanged(oldSender, _newSender);
    }

    /// @inheritdoc IEvmAccessorsFacet
    function resetSystemSender() external override {
        EvmAccessors.setMsgSenderOverride(address(0));
        emit SystemSenderReset();
    }

    /// @inheritdoc IEvmAccessorsFacet
    function blockTimestamp() external view override returns (uint256) {
        return EvmAccessors.getBlockTimestamp();
    }

    /**
     * @notice Asserts that the configured chain id matches an expected value.
     * @dev Used by chainId-override tests to verify the override flows through to
     *      `EvmAccessors.getChainId()`. Reverts with `WrongChainId()` on mismatch.
     *      Deliberately not declared on `IEvmAccessorsFacet`: it is a test-only
     *      assertion helper, so keeping it off the interface avoids bloating the
     *      facet's EIP-165 `interfaceId` while the selector is still registered.
     * @param chainId The chain id the resolved value is expected to equal.
     */
    function checkBlockChainId(uint256 chainId) external view {
        if (EvmAccessors.getChainId() != chainId) revert WrongChainId();
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_EVM_ACCESSORS;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex = 11;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.initializeEvmAccessors.selector;
            staticFunctionSelectors_[--selectorIndex] = this.resetSystemSender.selector;
            staticFunctionSelectors_[--selectorIndex] = this.changeSystemSender.selector;
            staticFunctionSelectors_[--selectorIndex] = this.resetSystemChainId.selector;
            staticFunctionSelectors_[--selectorIndex] = this.changeSystemChainId.selector;
            staticFunctionSelectors_[--selectorIndex] = this.resetSystemBlockNumber.selector;
            staticFunctionSelectors_[--selectorIndex] = this.changeSystemBlockNumber.selector;
            staticFunctionSelectors_[--selectorIndex] = this.checkBlockChainId.selector;
            staticFunctionSelectors_[--selectorIndex] = this.blockTimestamp.selector;
            staticFunctionSelectors_[--selectorIndex] = this.resetSystemTimestamp.selector;
            staticFunctionSelectors_[--selectorIndex] = this.changeSystemTimestamp.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure virtual override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IEvmAccessorsFacet).interfaceId;
        }
    }

    /**
     * @notice Reverts with `InvalidBlockNumber` when the override is zero.
     * @param _blockNumber The candidate block number override.
     */
    function _checkBlockNumber(uint256 _blockNumber) private pure {
        if (_blockNumber == 0) revert InvalidBlockNumber(_blockNumber);
    }

    /**
     * @notice Reverts with `InvalidChainId` when the override is zero.
     * @param _chainId The candidate chain id override.
     */
    function _checkChainId(uint256 _chainId) private pure {
        if (_chainId == 0) revert InvalidChainId(_chainId);
    }

    /**
     * @notice Reverts with `InvalidSender` when the override is the zero address.
     * @dev The zero address is the override sentinel (meaning "no override"), so it
     *      cannot be set as an explicit override — callers use `resetSystemSender` instead.
     * @param _sender The candidate sender override.
     */
    function _checkSender(address _sender) private pure {
        if (_sender == address(0)) revert InvalidSender(_sender);
    }
}
