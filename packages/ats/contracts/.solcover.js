module.exports = {
  configureYulOptimizer: true,
  // istanbulFolder: "../../../coverage/contracts",
  istanbulReporter: ["html", "json", "lcov"],
  skipFiles: [
    "mocks/",
    "test/",
    "infrastructure/utils/UnexpectedError.sol",
    "hardhat-dependency-compiler/",
    "infrastructure/utils/EvmAccessors.sol",
  ],
  providerOptions: {
    allowUnlimitedContractSize: true,
    gas: 0xfffffffffff,
    gasLimit: 0xfffffffffff,
    blockGasLimit: 0xfffffffffff,
  },
};
