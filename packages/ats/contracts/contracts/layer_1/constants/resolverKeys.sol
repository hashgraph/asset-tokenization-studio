// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length

// keccak256("security.token.standard.accesscontrol.resolverKey");
bytes32 constant _ACCESS_CONTROL_RESOLVER_KEY = 0x011768a41cb4fe76a26f444eec15d81a0d84e919a36336d72c6539cf41c0fcf6;

// keccak256("security.token.standard.accesscontrol.fixed.rate.resolverKey");
bytes32 constant _ACCESS_CONTROL_FIXED_RATE_RESOLVER_KEY = 0xb35ad81b5769c62538fe6a90e40db8be624645f77c1738ce582ede5da399ecb2;

// keccak256("security.token.standard.accesscontrol.kpilinked.rate.resolverKey");
bytes32 constant _ACCESS_CONTROL_KPI_LINKED_RATE_RESOLVER_KEY = 0x465c95eea6723a1645e5399789cee702b19d0bcd0ad3f894270aa25488fb4ab9;

// keccak256("security.token.standard.accesscontrol.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ACCESS_CONTROL_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x9d13e61abd630355ccae4279993868d7cf3b04d4368a0fedcefe6fec3fabaa0c;

// keccak256("security.token.standard.controllist.resolverKey");
bytes32 constant _CONTROL_LIST_RESOLVER_KEY = 0xfbb1491bfcecd95f79409bd5a4b69a4ba1e5573573372f5d2d66c11e3016414c;

// keccak256("security.token.standard.controllist.fixed.rate.resolverKey");
bytes32 constant _CONTROL_LIST_FIXED_RATE_RESOLVER_KEY = 0x083b7e0957ebd3a0f69bf432ce05d94c1848cbdbf0e66664919c4803b14dfdf8;

// keccak256("security.token.standard.controllist.kpilinked.rate.resolverKey");
bytes32 constant _CONTROL_LIST_KPI_LINKED_RATE_RESOLVER_KEY = 0xaaa80b13f9a051b7f9546e92763bedfbe259f511da870cbb1133fe0e79c8eac5;

// keccak256("security.token.standard.controllist.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _CONTROL_LIST_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xe3fbab5a4ccf7a873a9601bf5494c43f6e4b53218ff8310ec97811471397b3cf;

// keccak256("security.token.standard.pause.resolverKey");
bytes32 constant _PAUSE_RESOLVER_KEY = 0x9429fd9ef38f89f41bd9ec33fd5c94b287ed1c27a98938da43835ac761b2f92c;

// keccak256("security.token.standard.cap.resolverKey");
bytes32 constant _CAP_RESOLVER_KEY = 0xfb3f8aac36661b5540c571d821c80dc9db7ede5ca2a4204ee562b3356f0c026b;

// keccak256("security.token.standard.cap.fixed.rate.resolverKey");
bytes32 constant _CAP_FIXED_RATE_RESOLVER_KEY = 0x288b5a4b82f38369168fd49de3e5e68c76fc0394c2e89817b70a65368ba4dcf7;

// keccak256("security.token.standard.cap.kpilinked.rate.resolverKey");
bytes32 constant _CAP_KPI_LINKED_RATE_RESOLVER_KEY = 0xdc8cc0612bf886bcc1666e31c5de3392bee78451de7213b01fe78d560a804435;

// keccak256("security.token.standard.cap.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _CAP_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xa321c5301bbccd760c5aaf08286a67948cb7d49be22c17f12aa163b324a276d0;

// keccak256("security.token.standard.erc20.resolverKey");
bytes32 constant _ERC20_RESOLVER_KEY = 0x064c883089ba1a596d9146c7aaa73c19ef8825f374c67a9538787c3d12e68dc5;

// keccak256("security.token.standard.erc20.fixed.rate.resolverKey");
bytes32 constant _ERC20_FIXED_RATE_RESOLVER_KEY = 0x3e4f428a95dadb9b2d5121c4067c845270879ee5e180e4c4d03ad40f00160376;

// keccak256("security.token.standard.erc20.kpilinked.rate.resolverKey");
bytes32 constant _ERC20_KPI_LINKED_RATE_RESOLVER_KEY = 0xe4565636726032d04f6d265d3ee61c2f046ea49ecb39f4ca68dd4f65713e9620;

// keccak256("security.token.standard.erc20.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ERC20_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x002a101a46899eecb6af6a76839f76be301e6292a6a5d3eb7a1bae4a0d3574ee;

// keccak256("security.token.standard.erc20votes.resolverKey");
bytes32 constant _ERC20VOTES_RESOLVER_KEY = 0x5cbfbaa435e19a43530a00ac685c9b5252862a94af2053667ded44642a0d9f4c;

// keccak256("security.token.standard.erc20votes.fixed.rate.resolverKey");
bytes32 constant _ERC20VOTES_FIXED_RATE_RESOLVER_KEY = 0xce2bc140ce5298990432f0332c33ccaa813a89e3bc3c0589eb30eabe005d2742;

// keccak256("security.token.standard.erc20votes.kpilinked.rate.resolverKey");
bytes32 constant _ERC20VOTES_KPI_LINKED_RATE_RESOLVER_KEY = 0x9d720cb6c08dff4ea63b2b4f3908fa551321fdc478de6b46a67ba5ecb46f82fc;

// keccak256("security.token.standard.erc20votes.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ERC20VOTES_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x9d7e0002a7ae9c94734d62ac85bb1cd4c333dd6c5fb308a7a2b60dd77dfa9d44;

// keccak256("security.token.standard.erc1594.resolverKey");
bytes32 constant _ERC1594_RESOLVER_KEY = 0xcb70773e8163595d8bd906e277adeb3935976ad802ee8c29face3dfb0263291f;

// keccak256("security.token.standard.erc1594.fixed.rate.resolverKey");
bytes32 constant _ERC1594_FIXED_RATE_RESOLVER_KEY = 0x7a8f3e6d2c4b1a9e5f7d8c6b4a2e1f9d7c5b3a1e9f7d5c3b1a9e7f5d3c1b9e7f;

// keccak256("security.token.standard.erc1594.kpilinked.rate.resolverKey");
bytes32 constant _ERC1594_KPI_LINKED_RATE_RESOLVER_KEY = 0x1b4e7a9d3f5c2e8a6d4b9f7e5c3a1d8f6e4c2a9d7f5e3c1b8f6d4e2c9a7f5d3e;

// keccak256("security.token.standard.erc1594.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ERC1594_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x2c5f8a3d6e9b1f4c7a2e5d8b1f4c7a2e5d8b1f4c7a2e5d8b1f4c7a2e5d8b1f4c;

// keccak256("security.token.standard.erc20permit.resolverKey");
bytes32 constant _ERC20PERMIT_RESOLVER_KEY = 0xef05f0313623d32145212ed45620c8b2c8c294b3d6955cf26f3d1b0569fbc1fa;

// keccak256("security.token.standard.erc20permit.fixed.rate.resolverKey");
bytes32 constant _ERC20PERMIT_FIXED_RATE_RESOLVER_KEY = 0xc85b8a95de0375d3b552d368932ecaeb9fe85d470eb1e89bc29040cb35d168a3;

// keccak256("security.token.standard.erc20permit.kpilinked.rate.resolverKey");
bytes32 constant _ERC20PERMIT_KPI_LINKED_RATE_RESOLVER_KEY = 0x468437a5a7a128b245fb2c3ac08cf17e5f2a6983dece41309b58fffa1fca80a9;

// keccak256("security.token.standard.erc20permit.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ERC20PERMIT_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x3bf8d35ad3c3320d95184dd4f9a0bfc2e56b151318d9d27eefa74461d24f5c61;

// keccak256("security.token.standard.erc1643.resolverKey");
bytes32 constant _ERC1643_RESOLVER_KEY = 0x24543637956a3076689f171d3932b10f22d40f3785d53acebb340f37bed01625;

// keccak256("security.token.standard.erc1643.fixed.rate.resolverKey");
bytes32 constant _ERC1643_FIXED_RATE_RESOLVER_KEY = 0x3d6e9f1c5a8b2e7f4d9c6a3e1f8d5c2a9f6e3d1c8f5e2d9c6f3e1d8c5f2d9c6f;

// keccak256("security.token.standard.erc1643.kpilinked.rate.resolverKey");
bytes32 constant _ERC1643_KPI_LINKED_RATE_RESOLVER_KEY = 0x4e7f1a2d5c8e3f6a9d2e5f8c1d4a7e2f5c8d1e4f7c2e5d8f1e4c7d2f5e8d1f4e;

// keccak256("security.token.standard.erc1643.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ERC1643_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x5f8d2a3e6c9f1d4e7a2f5c8d1e4f7c2e5d8f1e4c7d2f5e8d1f4c7e2d5f8d1f4c;

// keccak256("security.token.standard.erc1410.read.resolverKey");
bytes32 constant _ERC1410_READ_RESOLVER_KEY = 0x5eb2734b83ea80c3eb63463a6192b30ab2526cb7a073f0abfda1a404c92ae497;

// keccak256("security.token.standard.erc1410.read.fixed.rate.resolverKey");
bytes32 constant _ERC1410_READ_FIXED_RATE_RESOLVER_KEY = 0x289451d28da5d8ff4e7759db6b1c418b7871f0d6ad63bf7f75cd411f3d79686d;

// keccak256("security.token.standard.erc1410.read.kpilinked.rate.resolverKey");
bytes32 constant _ERC1410_READ_KPI_LINKED_RATE_RESOLVER_KEY = 0x696d9b2b17b535f70254309692c77475c258c27dfa6853bbecc611bc350136cd;

// keccak256("security.token.standard.erc1410.read.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ERC1410_READ_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x7c15e98edcc41b3177b8cfff7055cd57b47000fd843fce22e7ead13f07e346b6;

// keccak256("security.token.standard.erc1410.tokenHolder.resolverKey");
bytes32 constant _ERC1410_TOKEN_HOLDER_RESOLVER_KEY = 0x0466bf860d23f1ecbc25f364735e0dc3830d236f09182599831730ddd2792caa;

// keccak256("security.token.standard.erc1410.tokenHolder.fixed.rate.resolverKey");
bytes32 constant _ERC1410_TOKEN_HOLDER_FIXED_RATE_RESOLVER_KEY = 0xfd248a6ee4af07046520c6ec6f9b61a009db5407ec2f967775040cd67b66f08d;

// keccak256("security.token.standard.erc1410.tokenHolder.kpilinked.rate.resolverKey");
bytes32 constant _ERC1410_TOKEN_HOLDER_KPI_LINKED_RATE_RESOLVER_KEY = 0x463e4b758e14b6cdc1dd053ae3df476d527be8131eb3b41c64b4cf8019855237;

// keccak256("security.token.standard.erc1410.tokenHolder.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ERC1410_TOKEN_HOLDER_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x6e21f1ca6d12f08b0d36f08711a48500d02dcf7edd2e8b87e4de350b98df4822;

// keccak256("security.token.standard.erc1410.management.resolverKey");
bytes32 constant _ERC1410_MANAGEMENT_RESOLVER_KEY = 0x232f8686795d3f197681faf0d8db05655e759f62d709d56b97e5d9cfff29dbf5;

// keccak256("security.token.standard.erc1410.management.fixed.rate.resolverKey");
bytes32 constant _ERC1410_MANAGEMENT_FIXED_RATE_RESOLVER_KEY = 0xf616851e84bfcfb3b33a8cc54c54c34e9168ba2b8d233a0b3daacee27f0266ca;

// keccak256("security.token.standard.erc1410.management.kpilinked.rate.resolverKey");
bytes32 constant _ERC1410_MANAGEMENT_KPI_LINKED_RATE_RESOLVER_KEY = 0x831449a00c9cf218fe471b13f84f7109b57ad4b1202d4ed93009ee3d53276a2f;

// keccak256("security.token.standard.erc1410.management.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ERC1410_MANAGEMENT_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x6768fcc73686ddd306656061b0e415208ded041927d9935de3747583559d0c5e;

// keccak256("security.token.standard.erc1410.issuer.resolverKey");
bytes32 constant _ERC1410_ISSUER_RESOLVER_KEY = 0x6e82b75f32c9647cc00b4c3eabbef5a82677f3e91d5d196eb4dd6a0365941344;

// keccak256("security.token.standard.erc1410.issuer.fixed.rate.resolverKey");
bytes32 constant _ERC1410_ISSUER_FIXED_RATE_RESOLVER_KEY = 0xb9c76f134ffdac743e817a2726bdf9f28a48dfea1f9f54b1066e4e0de68f2a06;

// keccak256("security.token.standard.erc1410.issuer.kpilinked.rate.resolverKey");
bytes32 constant _ERC1410_ISSUER_KPI_LINKED_RATE_RESOLVER_KEY = 0x97246e7c6950bcc047f6ea198308a7f304bca9f3f13d2ce5d7fdeee9cc9e0828;

// keccak256("security.token.standard.erc1410.issuer.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ERC1410_ISSUER_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x4d5a3964d29183253487011c31ec3e09977b5eded43c8a3a222a2e53f4282f61;

// keccak256("security.token.standard.erc1644.resolverKey");
bytes32 constant _ERC1644_RESOLVER_KEY = 0xf1da2ed271d62ba0b6597874c96fb6ed7d929e5ec679f4ad8c2c516c72f6736d;

// keccak256("security.token.standard.erc1644.fixed.rate.resolverKey");
bytes32 constant _ERC1644_FIXED_RATE_RESOLVER_KEY = 0x6f9e3d1c8a5f2e9d6c3f1e8d5c2f9e6d3f1e8c5f2d9e6c3f1d8e5c2f9d6e3f1d;

// keccak256("security.token.standard.erc1644.kpilinked.rate.resolverKey");
bytes32 constant _ERC1644_KPI_LINKED_RATE_RESOLVER_KEY = 0x7a1f4e2d5c8f3e6d9c2f5e8d1f4c7e2d5f8c1f4e7d2e5f8c1e4d7c2f5d8e1f4c;

// keccak256("security.token.standard.erc1644.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ERC1644_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x8b2f5e3d6f9c2e5d8f1e4c7d2e5f8d1f4c7e2d5f8d1f4c7e2d5f8d1f4c7e2d5f;

// keccak256("security.token.standard.snapshots.resolverKey");
bytes32 constant _SNAPSHOTS_RESOLVER_KEY = 0x9a3fc46d83536ef6b87eb4fec37302bfd1a7c18e81ea2da853b911b44cf5b0cf;

// keccak256("security.token.standard.resolver.proxy.resolverKey")
bytes32 constant _RESOLVER_PROXY_RESOLVER_KEY = 0x6fe19cad2a96b3f5852be16d059cc4c233139891fc04dc506c03d297d5f12c1e;

// keccak256("security.token.standard.diamond.loupe.resolverKey")
bytes32 constant _DIAMOND_LOUPE_RESOLVER_KEY = 0x086a1dd0b9bfa39267d1de30445a8edeb3a1f50c8a0a82c91f9dee3608e83567;

// keccak256("security.token.standard.diamond.cut.resolverKey")
bytes32 constant _DIAMOND_CUT_RESOLVER_KEY = 0xb66fc45b2670ed2c4ce03061121e6c8e53bce06e161f95afad8e57671b64fca8;

// keccak256("security.token.standard.diamond.resolverKey")
bytes32 constant _DIAMOND_RESOLVER_KEY = 0x1b5212ea37fb29e99afa2812a5d7d7e662a477424d3de1a18cc3871a2ee94d78;

// keccak256("security.token.standard.corporateActions.resolverKey")
bytes32 constant _CORPORATE_ACTIONS_RESOLVER_KEY = 0x3cc74200ccfb5d585a6d170f8824979dbf1b592e0a41eef41cf6d86cf4882077;

// keccak256("security.token.standard.corporateactions.fixed.rate.resolverKey");
bytes32 constant _CORPORATE_ACTIONS_FIXED_RATE_RESOLVER_KEY = 0xd2c0415cebdbb6dcaf014ce92df6bcae060743c622fd7ce954105b71954e0424;

// keccak256("security.token.standard.corporateactions.kpilinked.rate.resolverKey");
bytes32 constant _CORPORATE_ACTIONS_KPI_LINKED_RATE_RESOLVER_KEY = 0xf86b1190fb42cc572ccdeac774fdf968c303079b8c5eceaeb1c9f4f9089bb6be;

// keccak256("security.token.standard.corporateactions.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _CORPORATE_ACTIONS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xa4a23267cb0a22c52bd05b12e644136bc38b7ac51218a0cb3aed166697caa79e;

// keccak256("security.token.standard.lock.resolverKey")
bytes32 constant _LOCK_RESOLVER_KEY = 0xf1364345b3db5ebe5808f2d2d2aaecb9cdb4fddacad1534033060ebc886fc1e9;

// keccak256("security.token.standard.protected.partitions.resolverKey")
bytes32 constant _PROTECTED_PARTITIONS_RESOLVER_KEY = 0x6d65d2938c05a4d952aff0845c1baa5bea04d4544db74f8b3b26004d1d58d58f;

// keccak256("security.token.standard.hold.tokenHolder.resolverKey")
bytes32 constant _HOLD_TOKEN_HOLDER_RESOLVER_KEY = 0x87b17a3ce9a86872f21469d26f005543a22ef5729998559f4ad433d5c4253f3e;

// keccak256("security.token.standard.hold.management.resolverKey")
bytes32 constant _HOLD_MANAGEMENT_RESOLVER_KEY = 0xaab5a0e0978ad146ca8dc61d16bab0212224eadf68bd08e3c66600ee4f59c12a;

// keccak256("security.token.standard.holdRead.resolverKey")
bytes32 constant _HOLD_READ_RESOLVER_KEY = 0xd8a2714462c01975a075ccd4be2588934afd8074afef746fac089b757b803851;

// keccak256("security.token.standard.ssi.management.resolverKey")
bytes32 constant _SSI_MANAGEMENT_RESOLVER_KEY = 0x46df6aaf3742e0cbad136a74fb679b686e087dcc3a3d92d1c4ce2f3ef1b508a0;

// keccak256("security.token.standard.kyc.resolverKey")
bytes32 constant _KYC_RESOLVER_KEY = 0xf516a0f6b4726244ae916c590cd26c2b593d7d448e46e43714fb9f9435c46e32;

// keccak256("security.token.standard.clearing.transfer.resolverKey")
bytes32 constant _CLEARING_TRANSFER_RESOLVER_KEY = 0x7399d03db62430bec60ca2c3eacf98b1b7e2253f17593ef7a226d759442e0928;

// keccak256("security.token.standard.clearing.redeem.resolverKey")
bytes32 constant _CLEARING_REDEEM_RESOLVER_KEY = 0xb341e7aa749da43976c189209de51ccdf838af9f964cd27340b914d5b2aeba97;

// keccak256("security.token.standard.clearing.holdCreation.resolverKey")
bytes32 constant _CLEARING_HOLDCREATION_RESOLVER_KEY = 0x44f99a141c434fac20d69e7511932ee344d5b37b61851976c83a5df4ca468152;

// keccak256("security.token.standard.clearing.read.resolverKey")
bytes32 constant _CLEARING_READ_RESOLVER_KEY = 0xebb2e29bdf4edaf4ca66a3f9b7735087f9d0474d56d856e53c94ef00596c0b1e;

// keccak256("security.token.standard.clearing.actions.resolverKey")
bytes32 constant _CLEARING_ACTIONS_RESOLVER_KEY = 0x5472dfc5c92ad7a8651518ea7d3854d3b6494e5bcaa19f91cd61bf93bf6f2a74;

// keccak256("security.token.standard.clearing.transfer.fixed.rate.resolverKey");
bytes32 constant _CLEARING_TRANSFER_FIXED_RATE_RESOLVER_KEY = 0x1ba056fe3e7ef86779515a9e7f364e84af0f60eb5f4175ac6d6e6e3f4c05fffb;

// keccak256("security.token.standard.clearing.transfer.kpilinked.rate.resolverKey");
bytes32 constant _CLEARING_TRANSFER_KPI_LINKED_RATE_RESOLVER_KEY = 0x1b229a6d3b8a8ecba97d1e7c2c4a89c4cf71b9b5852317278f57384d728f8bde;

// keccak256("security.token.standard.clearing.transfer.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _CLEARING_TRANSFER_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x7e29efe8ee5285a43acddbe766fd9219266a74cb24ed3331b4e350d8e263d0c7;

// keccak256("security.token.standard.clearing.redeem.fixed.rate.resolverKey");
bytes32 constant _CLEARING_REDEEM_FIXED_RATE_RESOLVER_KEY = 0xa8edf3401d5e3f8e9a45b0992984a31a2522a24ed793e5e7980f8d66508473c9;

// keccak256("security.token.standard.clearing.redeem.kpilinked.rate.resolverKey");
bytes32 constant _CLEARING_REDEEM_KPI_LINKED_RATE_RESOLVER_KEY = 0xc38aaff0161104c594b7a323af3facf5beb1e304b730fcbee09f5eed74b11375;

// keccak256("security.token.standard.clearing.redeem.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _CLEARING_REDEEM_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xc4731d62375990b9721357983c8f6acf3fdc78d7814919c187607f653b768d5d;

// keccak256("security.token.standard.clearing.holdCreation.fixed.rate.resolverKey");
bytes32 constant _CLEARING_HOLDCREATION_FIXED_RATE_RESOLVER_KEY = 0xf4d60b90b7a9edb9598b8c4aa2a4477e3a65750eab2cce564385f35d882a23c3;

// keccak256("security.token.standard.clearing.holdCreation.kpilinked.rate.resolverKey");
bytes32 constant _CLEARING_HOLDCREATION_KPI_LINKED_RATE_RESOLVER_KEY = 0x1ba40338a89cd18f2799a3e6a86f0be118236340eeff5a19a19a08d3d6e3d08c;

// keccak256("security.token.standard.clearing.holdCreation.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _CLEARING_HOLDCREATION_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x0e59e36a2b1298d11c3612c3203c6d45cb185879383f5a22617c4f49495c070d;

// keccak256("security.token.standard.clearing.read.fixed.rate.resolverKey");
bytes32 constant _CLEARING_READ_FIXED_RATE_RESOLVER_KEY = 0xcd312e798e5b62ec98cc7c8ac3547a640f68ee74e351b73397be02dab3d5b14f;

// keccak256("security.token.standard.clearing.read.kpilinked.rate.resolverKey");
bytes32 constant _CLEARING_READ_KPI_LINKED_RATE_RESOLVER_KEY = 0x3740ea12ff1c9c37f216ba72884079bcaabe99f51cdd9b019be5b218ba5db0e2;

// keccak256("security.token.standard.clearing.read.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _CLEARING_READ_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xa188d3ee426a514ccfe03470d196ed29da48de0ae59898d9b5a30ec680515a11;

// keccak256("security.token.standard.clearing.actions.fixed.rate.resolverKey");
bytes32 constant _CLEARING_ACTIONS_FIXED_RATE_RESOLVER_KEY = 0x497fbb5ba36b9a6b791669e513c877ebfe079b61e0eb37afbd19b696266a0223;

// keccak256("security.token.standard.clearing.actions.kpilinked.rate.resolverKey");
bytes32 constant _CLEARING_ACTIONS_KPI_LINKED_RATE_RESOLVER_KEY = 0x4960adcd566163ba9edaee816f8739f1c788cace28ad805c136644de52929faa;

// keccak256("security.token.standard.clearing.actions.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _CLEARING_ACTIONS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xae9d6d2e1d9a660994e89e185ab5a3439d2def9baa6ba47fdf854ce0a29a5033;

// keccak256("security.token.standard.pause.management.resolverKey")
bytes32 constant _PAUSE_MANAGEMENT_RESOLVER_KEY = 0xadd2e196c17b4f607e327e46341eedbbbc3dce86ac90ceb3e7244b0a5f8590ac;

// keccak256("security.token.standard.controllist.management.resolverKey")
bytes32 constant _CONTROL_LIST_MANAGEMENT_RESOLVER_KEY = 0xb28d59e89fa116cebe06d8de737191b637a49d95f7d8d947d47ac000463e7c71;

// keccak256("security.token.standard.kyc.management.resolverKey")
bytes32 constant _KYC_MANAGEMENT_RESOLVER_KEY = 0x8676785f4d841823214e8ee8c497b3336a210be7559f5571c590249f6203e821;

// keccak256("security.token.standard.erc3643.read.resolverKey");
bytes32 constant _ERC3643_READ_RESOLVER_KEY = 0x7743c4e9ff26ef34c3c482d2c12dabe076035eb44bf1c736722f04c33c20ef6a;

// keccak256("security.token.standard.erc3643.read.fixed.rate.resolverKey");
bytes32 constant _ERC3643_READ_FIXED_RATE_RESOLVER_KEY = 0x53569c2059b40a4ccb6382b2180607da114ff92bfa263d7489ec7face7c4cc1f;

// keccak256("security.token.standard.erc3643.read.kpilinked.rate.resolverKey");
bytes32 constant _ERC3643_READ_KPI_LINKED_RATE_RESOLVER_KEY = 0x68ba78621a8627653774f3b9800b77ac34bd334ecc2dc4d933f9e30d6197194f;

// keccak256("security.token.standard.erc3643.read.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ERC3643_READ_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x2fc56e8abd44d0dc70cf8876ea454caab82a906ec6333516c1feb4de9b4cb4f8;

// keccak256("security.token.standard.erc3643.management.resolverKey");
bytes32 constant _ERC3643_MANAGEMENT_RESOLVER_KEY = 0xae7b7d0da6ac02e802a8d85aa821dd5cb84e8448836471680f744f64b678a073;

// keccak256("security.token.standard.erc3643.management.fixed.rate.resolverKey");
bytes32 constant _ERC3643_MANAGEMENT_FIXED_RATE_RESOLVER_KEY = 0xb82ec3e8b1d44871bbfe25257f4e57b7d9778bc578af2f0ce9ef218f6b897797;

// keccak256("security.token.standard.erc3643.management.kpilinked.rate.resolverKey");
bytes32 constant _ERC3643_MANAGEMENT_KPI_LINKED_RATE_RESOLVER_KEY = 0x649facd691e27202b46bb9e328ca96c6f6dc0aeefdd6cfc15707ee162b7d5103;

// keccak256("security.token.standard.erc3643.management.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ERC3643_MANAGEMENT_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x324a20f20a55098c207cd0bc42498561962995b82918d6a9697320c42c5b11fa;

// keccak256("security.token.standard.erc3643.operations.resolverKey");
bytes32 constant _ERC3643_OPERATIONS_RESOLVER_KEY = 0xe30b6b8e9e62fb8f017c940c7ffac12709f7ef6ae90beac5570fab25c7384e9c;

// keccak256("security.token.standard.erc3643.operations.fixed.rate.resolverKey");
bytes32 constant _ERC3643_OPERATIONS_FIXED_RATE_RESOLVER_KEY = 0x6524c4b11c24bcfff0472462572cdfbe5c671cad2df1ac54402e8a7b4dc3ee02;

// keccak256("security.token.standard.erc3643.operations.kpilinked.rate.resolverKey");
bytes32 constant _ERC3643_OPERATIONS_KPI_LINKED_RATE_RESOLVER_KEY = 0x87b7a50a7578f2499b459e665b6b7b809ac635280a2157d21fc5de0fc4b54715;

// keccak256("security.token.standard.erc3643.operations.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ERC3643_OPERATIONS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0xbe85d38775742687362efc4fc0ffed08044614079fc51bbf7b0f29e11d3ffafa;

// keccak256("security.token.standard.erc3643.batch.resolverKey");
bytes32 constant _ERC3643_BATCH_RESOLVER_KEY = 0x00332311d9f0c311b31b87399043a90feb10341fcbb4d7f4ed6e3c0072a3c392;

// keccak256("security.token.standard.erc3643.batch.fixed.rate.resolverKey");
bytes32 constant _ERC3643_BATCH_FIXED_RATE_RESOLVER_KEY = 0x3563ac36f573b2e288846d3437686b6a5137a7c9b5cbcd027816db63e07d4138;

// keccak256("security.token.standard.erc3643.batch.kpilinked.rate.resolverKey");
bytes32 constant _ERC3643_BATCH_KPI_LINKED_RATE_RESOLVER_KEY = 0xdf3ace3e8d3a434ee6c69da03060d81e1c8c217c16fad43a2819c0bc545253ae;

// keccak256("security.token.standard.erc3643.batch.SustainabilityPerformanceTarget.rate.resolverKey");
bytes32 constant _ERC3643_BATCH_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY = 0x500c4c5bff9db733228f1df9b6e818bf8fab883422d3fbe971c036b513e983d9;

// keccak256("security.token.standard.freeze.resolverKey");
bytes32 constant _FREEZE_RESOLVER_KEY = 0x49f765e7155d979a148049c2a0ebed5e028b11799061897a255f99314f0bd3f1;
