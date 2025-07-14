// SPDX-License-Identifier: BSD-3-Clause-Attribution
pragma solidity 0.8.18;

/**
 * @title Eip1066
 * @dev EIP-1066 Reason Codes as constants, grouped by category.
 *      See: https://eips.ethereum.org/EIPS/eip-1066
 */
library Eip1066 {
    // 0x0* Generic
    // | Code | Description                                 |
    // |------|---------------------------------------------|
    // | 0x00 | Failure                                     |
    // | 0x01 | Success                                     |
    // | 0x02 | Awaiting Others                             |
    // | 0x03 | Accepted                                    |
    // | 0x04 | Lower Limit or Insufficient                 |
    // | 0x05 | Receiver Action Requested                   |
    // | 0x06 | Upper Limit                                 |
    // | 0x07 | [reserved]                                  |
    // | 0x08 | Duplicate, Unnecessary, or Inapplicable     |
    // | 0x09 | [reserved]                                  |
    // | 0x0A | [reserved]                                  |
    // | 0x0B | [reserved]                                  |
    // | 0x0C | [reserved]                                  |
    // | 0x0D | [reserved]                                  |
    // | 0x0E | [reserved]                                  |
    // | 0x0F | Informational or Metadata                   |
    bytes1 private constant _FAILURE = 0x00;
    bytes1 private constant _SUCCESS = 0x01;
    bytes1 private constant _AWAITING_OTHERS = 0x02;
    bytes1 private constant _ACCEPTED = 0x03;
    bytes1 private constant _LOWER_LIMIT_OR_INSUFFICIENT = 0x04;
    bytes1 private constant _RECEIVER_ACTION_REQUESTED = 0x05;
    bytes1 private constant _UPPER_LIMIT = 0x06;
    bytes1 private constant _RESERVED_07 = 0x07;
    bytes1 private constant _DUPLICATE_UNNECESSARY_OR_INAPPLICABLE = 0x08;
    bytes1 private constant _RESERVED_09 = 0x09;
    bytes1 private constant _RESERVED_0A = 0x0A;
    bytes1 private constant _RESERVED_0B = 0x0B;
    bytes1 private constant _RESERVED_0C = 0x0C;
    bytes1 private constant _RESERVED_0D = 0x0D;
    bytes1 private constant _RESERVED_0E = 0x0E;
    bytes1 private constant _INFORMATIONAL_OR_METADATA = 0x0F;

    // 0x1* Permission & Control
    // | Code | Description                                 |
    // |------|---------------------------------------------|
    // | 0x10 | Disallowed or Stop                          |
    // | 0x11 | Allowed or Go                               |
    // | 0x12 | Awaiting Other’s Permission                 |
    // | 0x13 | Permission Requested                        |
    // | 0x14 | Too Open / Insecure                         |
    // | 0x15 | Needs Your Permission or Request for Continuation |
    // | 0x16 | Revoked or Banned                           |
    // | 0x17 | [reserved]                                  |
    // | 0x18 | Not Applicable to Current State             |
    // | 0x19 | [reserved]                                  |
    // | 0x1A | [reserved]                                  |
    // | 0x1B | [reserved]                                  |
    // | 0x1C | [reserved]                                  |
    // | 0x1D | [reserved]                                  |
    // | 0x1E | [reserved]                                  |
    // | 0x1F | Permission Details or Control Conditions    |
    bytes1 private constant _DISALLOWED_OR_STOP = 0x10;
    bytes1 private constant _ALLOWED_OR_GO = 0x11;
    bytes1 private constant _AWAITING_OTHERS_PERMISSION = 0x12;
    bytes1 private constant _PERMISSION_REQUESTED = 0x13;
    bytes1 private constant _TOO_OPEN_OR_INSECURE = 0x14;
    bytes1 private constant _NEEDS_YOUR_PERMISSION_OR_CONTINUATION = 0x15;
    bytes1 private constant _REVOKED_OR_BANNED = 0x16;
    bytes1 private constant _RESERVED_17 = 0x17;
    bytes1 private constant _NOT_APPLICABLE_TO_CURRENT_STATE = 0x18;
    bytes1 private constant _RESERVED_19 = 0x19;
    bytes1 private constant _RESERVED_1A = 0x1A;
    bytes1 private constant _RESERVED_1B = 0x1B;
    bytes1 private constant _RESERVED_1C = 0x1C;
    bytes1 private constant _RESERVED_1D = 0x1D;
    bytes1 private constant _RESERVED_1E = 0x1E;
    bytes1 private constant _PERMISSION_DETAILS_OR_CONTROL_CONDITIONS = 0x1F;

    // 0x2* Find, Inequalities & Range
    // | Code | Description                                 |
    // |------|---------------------------------------------|
    // | 0x20 | Not Found, Unequal, or Out of Range         |
    // | 0x21 | Found, Equal or In Range                    |
    // | 0x22 | Awaiting Match                              |
    // | 0x23 | Match Request Sent                          |
    // | 0x24 | Below Range or Underflow                    |
    // | 0x25 | Request for Match                           |
    // | 0x26 | Above Range or Overflow                     |
    // | 0x27 | [reserved]                                  |
    // | 0x28 | Duplicate, Conflict, or Collision           |
    // | 0x29 | [reserved]                                  |
    // | 0x2A | [reserved]                                  |
    // | 0x2B | [reserved]                                  |
    // | 0x2C | [reserved]                                  |
    // | 0x2D | [reserved]                                  |
    // | 0x2E | [reserved]                                  |
    // | 0x2F | Matching Meta or Info                       |
    bytes1 private constant _NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE = 0x20;
    bytes1 private constant _FOUND_EQUAL_OR_IN_RANGE = 0x21;
    bytes1 private constant _AWAITING_MATCH = 0x22;
    bytes1 private constant _MATCH_REQUEST_SENT = 0x23;
    bytes1 private constant _BELOW_RANGE_OR_UNDERFLOW = 0x24;
    bytes1 private constant _REQUEST_FOR_MATCH = 0x25;
    bytes1 private constant _ABOVE_RANGE_OR_OVERFLOW = 0x26;
    bytes1 private constant _RESERVED_27 = 0x27;
    bytes1 private constant _DUPLICATE_CONFLICT_OR_COLLISION = 0x28;
    bytes1 private constant _RESERVED_29 = 0x29;
    bytes1 private constant _RESERVED_2A = 0x2A;
    bytes1 private constant _RESERVED_2B = 0x2B;
    bytes1 private constant _RESERVED_2C = 0x2C;
    bytes1 private constant _RESERVED_2D = 0x2D;
    bytes1 private constant _RESERVED_2E = 0x2E;
    bytes1 private constant _MATCHING_META_OR_INFO = 0x2F;

    // 0x3* Negotiation & Governance
    // | Code | Description                                 |
    // |------|---------------------------------------------|
    // | 0x30 | Sender Disagrees or Nay                     |
    // | 0x31 | Sender Agrees or Yea                        |
    // | 0x32 | Awaiting Ratification                       |
    // | 0x33 | Offer Sent or Voted                         |
    // | 0x34 | Quorum Not Reached                          |
    // | 0x35 | Receiver’s Ratification Requested           |
    // | 0x36 | Offer or Vote Limit Reached                 |
    // | 0x37 | [reserved]                                  |
    // | 0x38 | Already Voted                               |
    // | 0x39 | [reserved]                                  |
    // | 0x3A | [reserved]                                  |
    // | 0x3B | [reserved]                                  |
    // | 0x3C | [reserved]                                  |
    // | 0x3D | [reserved]                                  |
    // | 0x3E | [reserved]                                  |
    // | 0x3F | Negotiation Rules or Participation Info     |
    bytes1 private constant _SENDER_DISAGREES_OR_NAY = 0x30;
    bytes1 private constant _SENDER_AGREES_OR_YEA = 0x31;
    bytes1 private constant _AWAITING_RATIFICATION = 0x32;
    bytes1 private constant _OFFER_SENT_OR_VOTED = 0x33;
    bytes1 private constant _QUORUM_NOT_REACHED = 0x34;
    bytes1 private constant _RECEIVER_RATIFICATION_REQUESTED = 0x35;
    bytes1 private constant _OFFER_OR_VOTE_LIMIT_REACHED = 0x36;
    bytes1 private constant _RESERVED_37 = 0x37;
    bytes1 private constant _ALREADY_VOTED = 0x38;
    bytes1 private constant _RESERVED_39 = 0x39;
    bytes1 private constant _RESERVED_3A = 0x3A;
    bytes1 private constant _RESERVED_3B = 0x3B;
    bytes1 private constant _RESERVED_3C = 0x3C;
    bytes1 private constant _RESERVED_3D = 0x3D;
    bytes1 private constant _RESERVED_3E = 0x3E;
    bytes1 private constant _NEGOTIATION_RULES_OR_PARTICIPATION_INFO = 0x3F;

    // 0x4* Availability & Time
    // | Code | Description                                 |
    // |------|---------------------------------------------|
    // | 0x40 | Unavailable                                 |
    // | 0x41 | Available                                   |
    // | 0x42 | Paused                                      |
    // | 0x43 | Queued                                      |
    // | 0x44 | Not Available Yet                           |
    // | 0x45 | Awaiting Your Availability                  |
    // | 0x46 | Expired                                     |
    // | 0x47 | [reserved]                                  |
    // | 0x48 | Already Done                                |
    // | 0x49 | [reserved]                                  |
    // | 0x4A | [reserved]                                  |
    // | 0x4B | [reserved]                                  |
    // | 0x4C | [reserved]                                  |
    // | 0x4D | [reserved]                                  |
    // | 0x4E | [reserved]                                  |
    // | 0x4F | Availability Rules or Info (ex. time since or until) |
    bytes1 private constant _UNAVAILABLE = 0x40;
    bytes1 private constant _AVAILABLE = 0x41;
    bytes1 private constant _PAUSED = 0x42;
    bytes1 private constant _QUEUED = 0x43;
    bytes1 private constant _NOT_AVAILABLE_YET = 0x44;
    bytes1 private constant _AWAITING_YOUR_AVAILABILITY = 0x45;
    bytes1 private constant _EXPIRED = 0x46;
    bytes1 private constant _RESERVED_47 = 0x47;
    bytes1 private constant _ALREADY_DONE = 0x48;
    bytes1 private constant _RESERVED_49 = 0x49;
    bytes1 private constant _RESERVED_4A = 0x4A;
    bytes1 private constant _RESERVED_4B = 0x4B;
    bytes1 private constant _RESERVED_4C = 0x4C;
    bytes1 private constant _RESERVED_4D = 0x4D;
    bytes1 private constant _RESERVED_4E = 0x4E;
    bytes1 private constant _AVAILABILITY_RULES_OR_INFO = 0x4F;

    // 0x5* Tokens, Funds & Finance
    // | Code | Description                                 |
    // |------|---------------------------------------------|
    // | 0x50 | Transfer Failed                             |
    // | 0x51 | Transfer Successful                         |
    // | 0x52 | Awaiting Payment From Others                |
    // | 0x53 | Hold or Escrow                              |
    // | 0x54 | Insufficient Funds                          |
    // | 0x55 | Funds Requested                             |
    // | 0x56 | Transfer Volume Exceeded                    |
    // | 0x57 | [reserved]                                  |
    // | 0x58 | Funds Not Required                          |
    // | 0x59 | [reserved]                                  |
    // | 0x5A | [reserved]                                  |
    // | 0x5B | [reserved]                                  |
    // | 0x5C | [reserved]                                  |
    // | 0x5D | [reserved]                                  |
    // | 0x5E | [reserved]                                  |
    // | 0x5F | Token or Financial Information              |
    bytes1 private constant _TRANSFER_FAILED = 0x50;
    bytes1 private constant _TRANSFER_SUCCESSFUL = 0x51;
    bytes1 private constant _AWAITING_PAYMENT_FROM_OTHERS = 0x52;
    bytes1 private constant _HOLD_OR_ESCROW = 0x53;
    bytes1 private constant _INSUFFICIENT_FUNDS = 0x54;
    bytes1 private constant _FUNDS_REQUESTED = 0x55;
    bytes1 private constant _TRANSFER_VOLUME_EXCEEDED = 0x56;
    bytes1 private constant _RESERVED_57 = 0x57;
    bytes1 private constant _FUNDS_NOT_REQUIRED = 0x58;
    bytes1 private constant _RESERVED_59 = 0x59;
    bytes1 private constant _RESERVED_5A = 0x5A;
    bytes1 private constant _RESERVED_5B = 0x5B;
    bytes1 private constant _RESERVED_5C = 0x5C;
    bytes1 private constant _RESERVED_5D = 0x5D;
    bytes1 private constant _RESERVED_5E = 0x5E;
    bytes1 private constant _TOKEN_OR_FINANCIAL_INFORMATION = 0x5F;

    // 0x6* TBD (reserved)
    // 0x7* TBD (reserved)
    // 0x8* TBD (reserved)
    // 0x9* TBD (reserved)

    // 0xA* Application-Specific Codes
    // | Code | Description                                 |
    // |------|---------------------------------------------|
    // | 0xA0 | App-Specific Failure                        |
    // | 0xA1 | App-Specific Success                        |
    // | 0xA2 | App-Specific Awaiting Others                |
    // | 0xA3 | App-Specific Acceptance                     |
    // | 0xA4 | App-Specific Below Condition                |
    // | 0xA5 | App-Specific Receiver Action Requested      |
    // | 0xA6 | App-Specific Expiry or Limit                |
    // | 0xA7 | [reserved]                                  |
    // | 0xA8 | App-Specific Inapplicable Condition         |
    // | 0xA9 | [reserved]                                  |
    // | 0xAA | [reserved]                                  |
    // | 0xAB | [reserved]                                  |
    // | 0xAC | [reserved]                                  |
    // | 0xAD | [reserved]                                  |
    // | 0xAE | [reserved]                                  |
    // | 0xAF | App-Specific Meta or Info                   |
    bytes1 private constant _APP_SPECIFIC_FAILURE = 0xA0;
    bytes1 private constant _APP_SPECIFIC_SUCCESS = 0xA1;
    bytes1 private constant _APP_SPECIFIC_AWAITING_OTHERS = 0xA2;
    bytes1 private constant _APP_SPECIFIC_ACCEPTANCE = 0xA3;
    bytes1 private constant _APP_SPECIFIC_BELOW_CONDITION = 0xA4;
    bytes1 private constant _APP_SPECIFIC_RECEIVER_ACTION_REQUESTED = 0xA5;
    bytes1 private constant _APP_SPECIFIC_EXPIRY_OR_LIMIT = 0xA6;
    bytes1 private constant _RESERVED_A7 = 0xA7;
    bytes1 private constant _APP_SPECIFIC_INAPPLICABLE_CONDITION = 0xA8;
    bytes1 private constant _RESERVED_A9 = 0xA9;
    bytes1 private constant _RESERVED_AA = 0xAA;
    bytes1 private constant _RESERVED_AB = 0xAB;
    bytes1 private constant _RESERVED_AC = 0xAC;
    bytes1 private constant _RESERVED_AD = 0xAD;
    bytes1 private constant _RESERVED_AE = 0xAE;
    bytes1 private constant _APP_SPECIFIC_META_OR_INFO = 0xAF;

    // 0xB* TBD (reserved)
    // 0xC* TBD (reserved)
    // 0xD* TBD (reserved)

    // 0xE* Encryption, Identity & Proofs
    // | Code | Description                                 |
    // |------|---------------------------------------------|
    // | 0xE0 | Decrypt Failure                             |
    // | 0xE1 | Decrypt Success                             |
    // | 0xE2 | Awaiting Other Signatures or Keys           |
    // | 0xE3 | Signed                                      |
    // | 0xE4 | Unsigned or Untrusted                       |
    // | 0xE5 | Signature Required                          |
    // | 0xE6 | Known to be Compromised                     |
    // | 0xE7 | [reserved]                                  |
    // | 0xE8 | Already Signed or Not Encrypted             |
    // | 0xE9 | [reserved]                                  |
    // | 0xEA | [reserved]                                  |
    // | 0xEB | [reserved]                                  |
    // | 0xEC | [reserved]                                  |
    // | 0xED | [reserved]                                  |
    // | 0xEE | [reserved]                                  |
    // | 0xEF | Cryptography, ID, or Proof Metadata         |
    bytes1 private constant _DECRYPT_FAILURE = 0xE0;
    bytes1 private constant _DECRYPT_SUCCESS = 0xE1;
    bytes1 private constant _AWAITING_OTHER_SIGNATURES_OR_KEYS = 0xE2;
    bytes1 private constant _SIGNED = 0xE3;
    bytes1 private constant _UNSIGNED_OR_UNTRUSTED = 0xE4;
    bytes1 private constant _SIGNATURE_REQUIRED = 0xE5;
    bytes1 private constant _KNOWN_TO_BE_COMPROMISED = 0xE6;
    bytes1 private constant _RESERVED_E7 = 0xE7;
    bytes1 private constant _ALREADY_SIGNED_OR_NOT_ENCRYPTED = 0xE8;
    bytes1 private constant _RESERVED_E9 = 0xE9;
    bytes1 private constant _RESERVED_EA = 0xEA;
    bytes1 private constant _RESERVED_EB = 0xEB;
    bytes1 private constant _RESERVED_EC = 0xEC;
    bytes1 private constant _RESERVED_ED = 0xED;
    bytes1 private constant _RESERVED_EE = 0xEE;
    bytes1 private constant _CRYPTOGRAPHY_ID_OR_PROOF_METADATA = 0xEF;

    // 0xF* Off-Chain
    // | Code | Description                                 |
    // |------|---------------------------------------------|
    // | 0xF0 | Off-Chain Failure                           |
    // | 0xF1 | Off-Chain Success                           |
    // | 0xF2 | Awaiting Off-Chain Process                  |
    // | 0xF3 | Off-Chain Process Started                   |
    // | 0xF4 | Off-Chain Service Unreachable               |
    // | 0xF5 | Off-Chain Action Required                   |
    // | 0xF6 | Off-Chain Expiry or Limit Reached           |
    // | 0xF7 | [reserved]                                  |
    // | 0xF8 | Duplicate Off-Chain Request                 |
    // | 0xF9 | [reserved]                                  |
    // | 0xFA | [reserved]                                  |
    // | 0xFB | [reserved]                                  |
    // | 0xFC | [reserved]                                  |
    // | 0xFD | [reserved]                                  |
    // | 0xFE | [reserved]                                  |
    // | 0xFF | Off-Chain Info or Meta                      |
    bytes1 private constant _OFF_CHAIN_FAILURE = 0xF0;
    bytes1 private constant _OFF_CHAIN_SUCCESS = 0xF1;
    bytes1 private constant _AWAITING_OFF_CHAIN_PROCESS = 0xF2;
    bytes1 private constant _OFF_CHAIN_PROCESS_STARTED = 0xF3;
    bytes1 private constant _OFF_CHAIN_SERVICE_UNREACHABLE = 0xF4;
    bytes1 private constant _OFF_CHAIN_ACTION_REQUIRED = 0xF5;
    bytes1 private constant _OFF_CHAIN_EXPIRY_OR_LIMIT_REACHED = 0xF6;
    bytes1 private constant _RESERVED_F7 = 0xF7;
    bytes1 private constant _DUPLICATE_OFF_CHAIN_REQUEST = 0xF8;
    bytes1 private constant _RESERVED_F9 = 0xF9;
    bytes1 private constant _RESERVED_FA = 0xFA;
    bytes1 private constant _RESERVED_FB = 0xFB;
    bytes1 private constant _RESERVED_FC = 0xFC;
    bytes1 private constant _RESERVED_FD = 0xFD;
    bytes1 private constant _RESERVED_FE = 0xFE;
    bytes1 private constant _OFF_CHAIN_INFO_OR_META = 0xFF;

    // ! NON-STANDARD CODES BELOW THIS LINE !
    // Application-specific reason codes for EIP-1066
    // | Constant Name                              | Meaning                           |
    // |--------------------------------------------|-----------------------------------|
    // | REASON_OPERATOR_ACCOUNT_BLOCKED            | Operator account is blocked       |
    // | FROM_ACCOUNT_BLOCKED_ERROR_ID              | From account is blocked           |
    // | TO_ACCOUNT_BLOCKED_ERROR_ID                | To account is blocked             |
    // | FROM_ACCOUNT_NULL_ERROR_ID                 | From account is null              |
    // | TO_ACCOUNT_NULL_ERROR_ID                   | To account is null                |
    // | NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID        | Not enough balance                |
    // | IS_NOT_OPERATOR_ERROR_ID                   | Is not operator                   |
    // | WRONG_PARTITION_ERROR_ID                   | Wrong partition                   |
    // | ALLOWANCE_REACHED_ERROR_ID                 | Allowance reached                 |
    // | FROM_ACCOUNT_KYC_ERROR_ID                  | From account KYC error            |
    // | TO_ACCOUNT_KYC_ERROR_ID                    | To account KYC error              |
    // | CLEARING_ACTIVE_ERROR_ID                   | Clearing is active                |
    // | ADDRESS_RECOVERED_OPERATOR_ERROR_ID        | Address recovered (operator)      |
    // | ADDRESS_RECOVERED_FROM_ERROR_ID            | Address recovered (from)          |
    // | ADDRESS_RECOVERED_TO_ERROR_ID              | Address recovered (to)            |
    bytes32 private constant _REASON_EMPTY = bytes32(0);
    bytes32 private constant _REASON_INVALID_ZERO_ADDRESS =
        keccak256('_REASON_INVALID_ZERO_ADDRESS');
    bytes32 private constant _REASON_CLEARING_IS_ACTIVE =
        keccak256('_REASON_CLEARING_IS_ACTIVE');
    bytes32 private constant _REASON_ADDRESS_RECOVERED =
        keccak256('_REASON_ADDRESS_RECOVERED');
    bytes32 private constant _REASON_ADDRESS_IN_BLACKLIST_OR_NOT_IN_WHITELIST =
        keccak256('_REASON_ADDRESS_IN_BLACKLIST_OR_NOT_IN_WHITELIST');
    bytes32 private constant _REASON_KYC_NOT_GRANTED =
        keccak256('_REASON_KYC_NOT_GRANTED');
    bytes32 private constant _REASON_INSUFFICIENT_BALANCE =
        keccak256('_REASON_INSUFFICIENT_BALANCE');
}
