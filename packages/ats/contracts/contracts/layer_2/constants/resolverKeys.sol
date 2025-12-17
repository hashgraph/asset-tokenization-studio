// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length

// keccak256('security.token.standard.equity.resolverKey');
bytes32 constant _EQUITY_RESOLVER_KEY = 0xfe85fe0513f5a5676011f59495ae16b2b93c981c190e99e61903e5603542c810;

// keccak256('security.token.standard.bond.variable.rate.resolverKey');
bytes32 constant _BOND_VARIABLE_RATE_RESOLVER_KEY = 0xe6594ee8f54f346ab25268fdc7955031a6b06102355e1446353d89ab1d593de3;

// keccak256('security.token.standard.bond.fixed.rate.resolverKey');
bytes32 constant _BOND_FIXED_RATE_RESOLVER_KEY = 0xd55d8787d23b78e70dada1ade45b8758f5c027e2cddf3556606c07d388ce159a;

// keccak256('security.token.standard.bond.kpilinked.rate.resolverKey');
bytes32 constant _BOND_KPI_LINKED_RATE_RESOLVER_KEY = 0x99c145ff21354eb7b25cb096873143fa3d3aba98457b96bcd13f1d1f2b9bf28c;

// keccak256('security.token.standard.bond.SustainabilityPerformanceTarget.rate.resolverKey');
bytes32 constant _BOND_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x8048a878c656dcf3886e69ad27a9272a4fb9499299ab5f0e1b6c99ac3b1130f8;

// keccak256('security.token.standard.bond.variable.read.resolverKey');
bytes32 constant _BOND_VARIABLE_READ_RESOLVER_KEY = 0x624866e79d4c0a78a8dc32cbce49563cdf86eba627bd05a9821dbaa1674ac231;

// keccak256('security.token.standard.bond.fixed.read.resolverKey');
bytes32 constant _BOND_FIXED_READ_RESOLVER_KEY = 0xd5d703d15aa25ad6419288846269dcbba84f489f1c986be2c919f84c042b8c24;

// keccak256('security.token.standard.bond.kpilinked.read.resolverKey');
bytes32 constant _BOND_KPI_LINKED_READ_RESOLVER_KEY = 0xcced91a2a03bf45bd62730a7f4703ee2d762f8ebccff315c7145258265f73249;

// keccak256('security.token.standard.bond.SustainabilityPerformanceTarget.read.resolverKey');
bytes32 constant _BOND_SUSTAINABILITY_PERFORMANCE_TARGET_READ_RESOLVER_KEY = 0x339d458f2928ef5148317aab39e4375a27e6c531d2e5b9de2d4fb23ad0e8b504;

// keccak256('security.token.standard.scheduled.snapshots.resolverKey');
bytes32 constant _SCHEDULED_SNAPSHOTS_RESOLVER_KEY = 0x100f681e33d02a1124c2c05a537a1229eca89767c5e6e8720066ca74bfb85793;

// keccak256("security.token.standard.scheduled.snapshots.fixed.rate.resolverKey")
bytes32 constant _SCHEDULED_SNAPSHOTS_FIXED_RATE_RESOLVER_KEY = 0xe3f0d8c05423e6bf8dc42fb776a1ce265739fc66f9b501077b207a0c2a56cab6;

// keccak256("security.token.standard.scheduled.snapshots.kpilinked.rate.resolverKey")
bytes32 constant _SCHEDULED_SNAPSHOTS_KPI_LINKED_RATE_RESOLVER_KEY = 0xbfb6dd5a6beac6604a320b8363bc0da4093ba327dd037970ad82d422b0d88526;

// keccak256("security.token.standard.scheduled.snapshots.SustainabilityPerformanceTarget.rate.resolverKey")
bytes32 constant _SCHEDULED_SNAPSHOTS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x99a85df534e32a3b9fce8e80f0cc30d6703e578eb5c641ab2d9e95530d046b4b;

// keccak256('security.token.standard.scheduled.balanceAdjustments.resolverKey');
bytes32 constant _SCHEDULED_BALANCE_ADJUSTMENTS_RESOLVER_KEY = 0xc418e67a48260d700e5f85863ad6fa6593206a4385728f8baba1572d631535e0;

// keccak256("security.token.standard.scheduled.balanceAdjustments.fixed.rate.resolverKey")
bytes32 constant _SCHEDULED_BALANCE_ADJUSTMENTS_FIXED_RATE_RESOLVER_KEY = 0xb3336a1ececdcd807fd6e81cc57e9392c75bf3fd303a2f5df0b11c0dda87ce7f;

// keccak256("security.token.standard.scheduled.balanceAdjustments.kpilinked.rate.resolverKey")
bytes32 constant _SCHEDULED_BALANCE_ADJUSTMENTS_KPI_LINKED_RATE_RESOLVER_KEY = 0x3da33aed4e04baa1b9c39bd96d0bc7be51ecaa1468eff7f632c29fb134644cb4;

// keccak256("security.token.standard.scheduled.balanceAdjustments.SustainabilityPerformanceTarget.rate.resolverKey")
bytes32 constant _SCHEDULED_BALANCE_ADJUSTMENTS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x1168df5bb8a348d137af6e29915c261dc82c495f72484a046ac4f750899625f4;

// keccak256('security.token.standard.scheduled.couponListing.resolverKey');
bytes32 constant _SCHEDULED_COUPON_LISTING_RESOLVER_KEY = 0x6cc7645ae5bcd122875ce8bd150bd28dda6374546c4c2421e5ae4fdeedb3ab30;

// keccak256("security.token.standard.scheduled.couponListing.fixed.rate.resolverKey")
bytes32 constant _SCHEDULED_COUPON_LISTING_FIXED_RATE_RESOLVER_KEY = 0x9c249eccb68ce7eae5f58a9b4fbe1f3b6a6f2a644b36c3f1b3559077b4f4e266;

// keccak256("security.token.standard.scheduled.couponListing.kpilinked.rate.resolverKey")
bytes32 constant _SCHEDULED_COUPON_LISTING_KPI_LINKED_RATE_RESOLVER_KEY = 0x9f42d2f2ae6efad6d2acf0399ec9e5a1bed9e41c68a86b58f1de78da4fe3c598;

// keccak256("security.token.standard.scheduled.couponListing.SustainabilityPerformanceTarget.rate.resolverKey")
bytes32 constant _SCHEDULED_COUPON_LISTING_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x85c0dee450a5a4657a9de39ca4ba19881b079d55d5bb64641d52f59bea709ba8;

// keccak256('security.token.standard.scheduled.tasks.resolverKey');
bytes32 constant _SCHEDULED_TASKS_RESOLVER_KEY = 0xa4934195ab83f1497ce5fc99b68d0f41694716bcfba5f232aa6c8e0d4d504f08;

// keccak256("security.token.standard.scheduled.crossOrderedTasks.fixed.rate.resolverKey")
bytes32 constant _SCHEDULED_CROSS_ORDERED_TASKS_FIXED_RATE_RESOLVER_KEY = 0x1312a5fa6cd5c7128015b199c47eacbf1636ef5cf437c0ee84c619dfbd372ca0;

// keccak256("security.token.standard.scheduled.crossOrderedTasks.kpilinked.rate.resolverKey")
bytes32 constant _SCHEDULED_CROSS_ORDERED_TASKS_KPI_LINKED_RATE_RESOLVER_KEY = 0x04d20e52e58dbadedfcf6c373a826fc5f7c665fd6caf67c8a65a9e777a8b70ec;

// keccak256("security.token.standard.scheduled.crossOrderedTasks.SustainabilityPerformanceTarget.rate.resolverKey")
bytes32 constant _SCHEDULED_CROSS_ORDERED_TASKS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x23d3302e505d889e80b20005bf316ccd7cbbd3c547a7305d600e8f0d9bc73267;

// keccak256('security.token.standard.balanceAdjustments.resolverKey');
bytes32 constant _BALANCE_ADJUSTMENTS_RESOLVER_KEY = 0x2bbe9fb018f1e7dd12b4442154e7fdfd75aec7b0a65d07debf49de4ece5fe8b8;

// keccak256("security.token.standard.balanceAdjustments.fixed.rate.resolverKey");
bytes32 constant _BALANCE_ADJUSTMENTS_FIXED_RATE_RESOLVER_KEY = 0xa7e8f6d5c4b3a2e1f9d8c7b6a5e4f3d2c1b9a8e7f6d5c4b3a2e1f9d8c7b6a5e4;

// keccak256("security.token.standard.balanceAdjustments.kpilinked.rate.resolverKey");
bytes32 constant _BALANCE_ADJUSTMENTS_KPI_LINKED_RATE_RESOLVER_KEY = 0xb8f9e7d6c5b4a3e2f1d9c8b7a6e5f4d3c2b1a9e8f7d6c5b4a3e2f1d9c8b7a6e5;

// keccak256("security.token.standard.balanceAdjustments.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _BALANCE_ADJUSTMENTS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xc9e1f8d7c6b5a4e3f2d1c9b8a7e6f5d4c3b2a1e9f8d7c6b5a4e3f2d1c9b8a7e6;

// keccak256('security.token.standard.proceedRecipients.resolverKey');
bytes32 constant _PROCEED_RECIPIENTS_RESOLVER_KEY = 0x87f4b676bf89cd24a01a78fd8e7fb2102c2f6d034be73d16402f7297e0ae625b;

// keccak256("security.token.standard.proceedRecipients.fixed.rate.resolverKey");
bytes32 constant _PROCEED_RECIPIENTS_FIXED_RATE_RESOLVER_KEY = 0xd1f2e9d8c7b6a5e4f3d2c1b9a8e7f6d5c4b3a2e1f9d8c7b6a5e4f3d2c1b9a8e7;

// keccak256("security.token.standard.proceedRecipients.kpilinked.rate.resolverKey");
bytes32 constant _PROCEED_RECIPIENTS_KPI_LINKED_RATE_RESOLVER_KEY = 0xe2f3e1d9c8b7a6e5f4d3c2b1a9e8f7d6c5b4a3e2f1d9c8b7a6e5f4d3c2b1a9e8;

// keccak256("security.token.standard.proceedRecipients.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _PROCEED_RECIPIENTS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xf3e4f2e1d9c8b7a6e5f4d3c2b1a9e8f7d6c5b4a3e2f1d9c8b7a6e5f4d3c2b1a9;

// keccak256('security.token.standard.fixedRate.resolverKey');
bytes32 constant _FIXED_RATE_RESOLVER_KEY = 0x2871e1c37f7423765d88b16528db7e80ad8e2bae5ab5d55e26659840c1d6b504;

// keccak256('security.token.standard.kpiLinkedRate.resolverKey');
bytes32 constant _KPI_LINKED_RATE_RESOLVER_KEY = 0x92999bd0329d03e46274ce7743ebe0060df95286df4fa7b354937b7d21757d22;

// keccak256('security.token.standard.sustainabilityPerformanceTargetRate.resolverKey');
bytes32 constant _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xa261a7434029a925924f47ccea7fbe12af1e56efd74e8f1d8ac23bec19a27e49;

// keccak256('security.token.standard.kpis.resolverKey');
bytes32 constant _KPIS_RESOLVER_KEY = 0xb228c36d89348606afcfbad286f8eddb0d0cdd727eefd0f0fd87f17ea0793051;
