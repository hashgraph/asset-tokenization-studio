// Mock for @terminal3/verify_vc to avoid LRU cache issues in tests
module.exports = {
  verifyVC: jest.fn().mockResolvedValue(true),
  verifyVP: jest.fn().mockResolvedValue(true),
};
