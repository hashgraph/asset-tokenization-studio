// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length

// keccak256('security.token.standard.accesscontrol.storage');
bytes32 constant _ACCESS_CONTROL_STORAGE_POSITION = 0x4765bbd856d800638d39a79262ebc6fdfb5833d0e59f32c5d482fe4c4a3554c1;

// keccak256('security.token.standard.controllist.storage');
bytes32 constant _CONTROL_LIST_STORAGE_POSITION = 0xd2a97f6f015eb0ef6e78a5d99ed4baddb1001474ec77117d69e09432533577d3;

// keccak256('security.token.standard.pause.storage');
bytes32 constant _PAUSE_STORAGE_POSITION = 0x5a5b295532a8b6e97bc9d45d68fc49b85a099545bac8f91f77706d392a1cea71;

// keccak256('security.token.standard.erc1594.storage');
bytes32 constant _ERC1594_STORAGE_POSITION = 0x919465d7e15b775c94035d2b592c0808b79e37ecb2e0ceb66bd8c481f998ee9f;

// keccak256('security.token.standard.erc1643.storage');
bytes32 constant _ERC1643_STORAGE_POSITION = 0xf570af0a020d64f3ea72a78716790700daaeb1b83730feca87e92c517de986ef;

// keccak256('security.token.standard.erc1410.operator.storage');
bytes32 constant _ERC1410_OPERATOR_STORAGE_POSITION = 0x319c8795293307b302697a4daf045524536834965f40eb730e6ca085ae32ae00;

// keccak256('security.token.standard.erc1644.storage');
bytes32 constant _ERC1644_STORAGE_POSITION = 0x78da7d6f03fa6ff51457b34dfcf6bc00f21877d08759f4b646f714d8f8c539f7;

// keccak256('security.token.standard.resolverProxy.storage');
bytes32 constant _RESOLVER_PROXY_STORAGE_POSITION = 0x4833864335c8f29dd85e3f7a36869cb90d5dc7167ae5000f7e1ce4d7c15d14ad;

// keccak256('security.token.standard.protectedpartitions.storage');
bytes32 constant _PROTECTED_PARTITIONS_STORAGE_POSITION = 0x564ecdb30bda57ccdf5f0ccce9a283978b97919c80a3230163042042418b1546;

// ERC1410BasicStorageWrapperRead.Partition.amount.slot
uint256 constant _PARTITION_AMOUNT_OFFSET = 0;

// ERC1410BasicStorageWrapperRead.Partition
uint256 constant _PARTITION_SIZE = 2;
