module.exports = {
  // istanbulFolder: "../../../coverage/contracts",
  istanbulReporter: ["html", "json", "lcov"],
  skipFiles: ["mocks/", "test/", "infrastructure/utils/UnexpectedError.sol"],
};
