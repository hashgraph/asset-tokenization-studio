let isVerificationValid = true;

module.exports = {
  verifyVc: jest.fn().mockImplementation(() =>
    Promise.resolve({
      isValid: isVerificationValid,
      message: isVerificationValid ? 'verified' : 'not verified',
    }),
  ),
  setVerificationValid: (value) => {
    isVerificationValid = value;
  },
};
