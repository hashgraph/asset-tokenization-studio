// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IDividendTypes
 * @author Asset Tokenization Studio Team
 * @notice Shared type module for the dividend domain — every facet, library, and storage wrapper
 *         that handles dividends references its structs through this interface.
 * @dev Pure types tier: structs only. Domain events and errors live on the writer interface
 *      (`IDividend`) where they are emitted/reverted; placing them here would force read-only
 *      facets that inherit `IDividendTypes` to pick up symbols they never use, bloating their
 *      EIP-165 interfaceId. Inherited by `IDividend` (writer) and by any read facet that needs
 *      to expose a dividend struct in its function signatures.
 */
interface IDividendTypes {
    /**
     * @notice Parameters captured when an operator schedules a new dividend corporate action.
     * @dev `recordDate` is the snapshot deadline; `executionDate` is when the dividend is paid.
     *      `amount` is denominated with `amountDecimals` precision so it can be compared against
     *      the underlying token's own decimals when computing per-holder pay-outs.
     * @param recordDate Unix timestamp of the snapshot taken to determine eligible holders.
     * @param executionDate Unix timestamp on which the dividend becomes payable.
     * @param amount Total amount distributed across eligible holders, scaled by `amountDecimals`.
     * @param amountDecimals Decimal precision applied to `amount`.
     */
    struct Dividend {
        uint256 recordDate;
        uint256 executionDate;
        uint256 amount;
        uint8 amountDecimals;
    }

    /**
     * @notice Persisted dividend record returned by domain queries — pairs the original parameters
     *         with the snapshot id the storage layer has bound to it.
     * @param dividend The original `Dividend` parameters captured at scheduling time.
     * @param snapshotId Identifier of the holder snapshot bound to this dividend; zero before the
     *        record date is reached.
     */
    struct RegisteredDividend {
        Dividend dividend;
        uint256 snapshotId;
    }

    /**
     * @notice Per-account view of a dividend, including the holder's balance at record date and
     *         the dividend metadata required to compute the payable amount.
     * @dev `recordDateReached` is true once the record date has passed; until then the balance and
     *      decimals fields are not yet meaningful.
     * @param tokenBalance Holder balance captured at the dividend snapshot (or zero if not yet reached).
     * @param amount Total dividend amount, scaled by `amountDecimals`.
     * @param amountDecimals Decimal precision applied to `amount`.
     * @param recordDate Unix timestamp of the dividend snapshot.
     * @param executionDate Unix timestamp on which the dividend becomes payable.
     * @param decimals Decimal precision of the underlying token at the snapshot.
     * @param recordDateReached True once the record date has passed.
     * @param isDisabled True when the dividend has been cancelled.
     */
    struct DividendFor {
        uint256 tokenBalance;
        uint256 amount;
        uint8 amountDecimals;
        uint256 recordDate;
        uint256 executionDate;
        uint8 decimals;
        bool recordDateReached;
        bool isDisabled;
    }

    /**
     * @notice Fractional representation of the dividend amount payable to a specific holder.
     * @dev Expressed as `numerator / denominator` to defer rounding decisions to the caller and
     *      avoid precision loss in on-chain integer arithmetic.
     * @param numerator Numerator of the payable fraction.
     * @param denominator Denominator of the payable fraction; never zero when `recordDateReached`.
     * @param recordDateReached True once the record date has passed; numerator/denominator are
     *        only meaningful when this is set.
     */
    struct DividendAmountFor {
        uint256 numerator;
        uint256 denominator;
        bool recordDateReached;
    }
}
