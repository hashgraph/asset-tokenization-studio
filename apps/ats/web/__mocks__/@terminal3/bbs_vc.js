// Mock for @terminal3/bbs_vc to avoid LRU cache issues in tests
module.exports = {
  issueBbsVc: jest.fn().mockResolvedValue({}),
  deriveProof: jest.fn().mockResolvedValue({}),
};
