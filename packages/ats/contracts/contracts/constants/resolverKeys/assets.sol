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

// keccak256('security.token.standard.bond.kpilinked.read.resolverKey');
bytes32 constant _BOND_KPI_LINKED_READ_RESOLVER_KEY = 0xcced91a2a03bf45bd62730a7f4703ee2d762f8ebccff315c7145258265f73249;

// keccak256('security.token.standard.bond.SustainabilityPerformanceTarget.read.resolverKey');
bytes32 constant _BOND_SUSTAINABILITY_PERFORMANCE_TARGET_READ_RESOLVER_KEY = 0x339d458f2928ef5148317aab39e4375a27e6c531d2e5b9de2d4fb23ad0e8b504;

// keccak256('security.token.standard.scheduled.snapshots.resolverKey');
bytes32 constant _SCHEDULED_SNAPSHOTS_RESOLVER_KEY = 0x100f681e33d02a1124c2c05a537a1229eca89767c5e6e8720066ca74bfb85793;

// keccak256('security.token.standard.scheduled.balanceAdjustments.resolverKey');
bytes32 constant _SCHEDULED_BALANCE_ADJUSTMENTS_RESOLVER_KEY = 0xc418e67a48260d700e5f85863ad6fa6593206a4385728f8baba1572d631535e0;

// keccak256('security.token.standard.scheduled.couponListing.resolverKey');
bytes32 constant _SCHEDULED_COUPON_LISTING_RESOLVER_KEY = 0x6cc7645ae5bcd122875ce8bd150bd28dda6374546c4c2421e5ae4fdeedb3ab30;

// keccak256('security.token.standard.scheduled.tasks.resolverKey');
bytes32 constant _SCHEDULED_TASKS_RESOLVER_KEY = 0xa4934195ab83f1497ce5fc99b68d0f41694716bcfba5f232aa6c8e0d4d504f08;

// keccak256("security.token.standard.scheduled.crossOrderedTasks.kpilinked.rate.resolverKey")
bytes32 constant _SCHEDULED_CROSS_ORDERED_TASKS_KPI_LINKED_RATE_RESOLVER_KEY = 0x04d20e52e58dbadedfcf6c373a826fc5f7c665fd6caf67c8a65a9e777a8b70ec;

// keccak256("security.token.standard.scheduled.crossOrderedTasks.SustainabilityPerformanceTarget.rate.resolverKey")
bytes32 constant _SCHEDULED_CROSS_ORDERED_TASKS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x23d3302e505d889e80b20005bf316ccd7cbbd3c547a7305d600e8f0d9bc73267;

// keccak256('security.token.standard.balanceAdjustments.resolverKey');
bytes32 constant _BALANCE_ADJUSTMENTS_RESOLVER_KEY = 0x2bbe9fb018f1e7dd12b4442154e7fdfd75aec7b0a65d07debf49de4ece5fe8b8;

// keccak256('security.token.standard.proceedRecipients.resolverKey');
bytes32 constant _PROCEED_RECIPIENTS_RESOLVER_KEY = 0x87f4b676bf89cd24a01a78fd8e7fb2102c2f6d034be73d16402f7297e0ae625b;

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

// keccak256('security.token.standard.kpis.latest.resolverKey');
bytes32 constant _KPIS_LATEST_RESOLVER_KEY = 0x74c5b383d6a5c70ac558779f6286a871cfb3fd94d076be0cae4861e57f4db077;

// keccak256('security.token.standard.kpis.latest.kpilinked.rate.resolverKey');
bytes32 constant _KPIS_LATEST_KPI_LINKED_RATE_RESOLVER_KEY = 0x9a05806c3d9c062dfa7983f282dccc0397cb5d4ebf19b80ad4b5586c1d8c6cc6;

// keccak256('security.token.standard.kpis.latest.SustainabilityPerformanceTarget.rate.resolverKey');
bytes32 constant _KPIS_LATEST_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xb668a0e99ee4bce486604d5a7097a4e5d837d1736e0cf43b190b56d0adea78b9;
