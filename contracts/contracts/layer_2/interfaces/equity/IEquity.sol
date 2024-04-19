// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

interface IEquity {
    enum DividendType {
        NONE,
        PREFERRED,
        COMMON
    }

    struct EquityDetailsData {
        bool votingRight;
        bool informationRight;
        bool liquidationRight;
        bool subscriptionRight;
        bool convertionRight;
        bool redemptionRight;
        bool putRight;
        DividendType dividendRight;
        bytes3 currency;
        uint256 nominalValue;
    }

    struct Voting {
        uint256 recordDate;
        bytes data;
    }

    struct RegisteredVoting {
        Voting voting;
        uint256 snapshotId;
    }

    struct Dividend {
        uint256 recordDate;
        uint256 executionDate;
        uint256 amount;
    }

    struct RegisteredDividend {
        Dividend dividend;
        uint256 snapshotId;
    }

    struct DividendFor {
        uint256 tokenBalance;
        uint256 amount;
        uint256 recordDate;
        uint256 executionDate;
        bool recordDateReached;
    }

    struct VotingFor {
        uint256 tokenBalance;
        uint256 recordDate;
        bytes data;
        bool recordDateReached;
    }

    function getEquityDetails()
        external
        view
        returns (EquityDetailsData memory equityDetailsData_);

    function setDividends(
        Dividend calldata _newDividend
    ) external returns (bool success_, uint256 dividendID_);

    function getDividends(
        uint256 _dividendID
    ) external view returns (RegisteredDividend memory registeredDividend_);

    function getDividendsFor(
        uint256 _dividendID,
        address _account
    ) external view returns (DividendFor memory dividendFor_);

    function getDividendsCount() external view returns (uint256 dividendCount_);

    /*
     Schedules a vote (corporate action) which is just a snapshot of series (partitions) with
      Voting rights at "record date". Returns true if success and the vote ID (incremental id).
     This function is used to record voting powers at given points in time. The actual voting process
      (voting options, decreasing voting power, counting votes etc...) is not included.
    */
    function setVoting(
        Voting calldata _newVoting
    ) external returns (bool success_, uint256 voteID_);

    // Returns vote properties
    function getVoting(
        uint256 _voteID
    ) external view returns (RegisteredVoting memory registeredVoting_);

    function getVotingFor(
        uint256 _voteID,
        address _account
    ) external view returns (VotingFor memory votingFor_);

    // Returns vote counts
    function getVotingCount() external view returns (uint256 votingCount_);
}
