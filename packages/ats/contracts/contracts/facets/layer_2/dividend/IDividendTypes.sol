// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IDividendTypes {
    struct Dividend {
        uint256 recordDate;
        uint256 executionDate;
        uint256 amount;
        uint8 amountDecimals;
    }

    struct RegisteredDividend {
        Dividend dividend;
        uint256 snapshotId;
    }

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

    struct DividendAmountFor {
        uint256 numerator;
        uint256 denominator;
        bool recordDateReached;
    }
}
