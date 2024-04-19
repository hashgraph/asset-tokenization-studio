export default {
  header: {
    title: "Bond creation",
    details: "Details",
    configuration: "Configuration",
    coupon: "Coupon",
    regulation: "Regulation",
    review: "Review",
  },

  stepTokenDetails: {
    title: "Bond details",
    subtitle:
      "Enter the basics details of the digital security to start creating it.",
    mandatoryFields: "*Mandatory fields",
    generalInformation: "General information",
    name: "Name",
    nameTooltip: "Bond’s name.",
    placeholderName: "Enter name",
    symbol: "Symbol",
    symbolTooltip: "Bond’s symbol.",
    placeholderSymbol: "Enter Symbol",
    decimals: "Decimals",
    decimalsTooltip: "Number of decimals units.",
    placeholderDecimals: "6",
    isin: "ISIN",
    isinTooltip: "International security identification number.",
    placeholderIsin: "12",
    bondPermissions: "Bond permissions",
    permissionControllable: "Controllable",
    permissionBlocklist: "Blocklist",
    permissionApprovalList: "Approval list",
    permissionControllableTooltip:
      "Enable Token Controller role and compliance control operations",
    permissionBlocklistTooltip:
      "Enable access control to the security using a list of blocked accounts",
    permissionApprovalListTooltip:
      "Enable access control to the security using a list of allowed accounts",
  },

  stepConfiguration: {
    title: "Configuration",
    subtitle: "Enter the bond details such as currency type, amount...  ",
    mandatoryFields: "*Mandatory fields",
    currency: "Currency",
    nominalValue: "Nominal value",
    nominalValueTooltip:
      "Vale of each token of the bond’s principal (in the selected currency), which will be returned to the bondholder at maturity.",
    nominalValuePlaceHolder: "Enter nominal value",
    numberOfUnits: "Number of bond units",
    numberOfUnitsTooltip: "Bond’s maximum supply.",
    numberOfUnitsPlaceHolder: "Enter bond units",
    totalAmount: "Total value",
    totalAmountTooltip:
      "Total tokenized value resulting of multiply number of shares * nominal value.",
    startingDate: "Starting date",
    startingDateTooltip: "Beginning of the bond's interest-earning period.",
    startingDatePlaceHolder: "Choose mint date",
    maturityDate: "Maturity date",
    maturityDateTooltip:
      "Date at which the bond’s principal will be returned to the bondholder.",
    maturityDatePlaceHolder: "Choose maturity date",
  },

  stepCoupon: {
    title: "Coupon details",
    mandatoryFields: "*Mandatory fields",
    couponType: "Coupon type",
    couponTypeTooltip:
      "<strong>- Fixed</strong>: Create a bond with a fixed coupon.<br /> <strong>- Custom</strong>: Create a bond with a zero-coupon by default. For floating coupons, can be added in the Set Coupons tab.",
    couponTypePlaceHolder: "Choose a coupon type",
    couponRate: "Coupon rate",
    couponRateTooltip: "Interest rate per coupon.",
    couponRatePlaceHolder: "Max 3 decimals",
    couponFrequency: "Coupon frequency",
    couponFrequencyTooltip:
      "Number of months between two consecutive coupons (each month represents 30 days).",
    couponFrequencyPlaceHolder: "Enter coupon frequency",
    firstCouponDate: "First coupon date",
    firstCouponDateTooltip:
      "First coupon record date. The subsequent coupon’s record dates will be calculated using the coupon frequency and the first coupon’s date.",
    firstCouponDatePlaceHolder: "Choose first coupon date",
    lastCouponDate: "Last coupon date",
    totalCoupons: "Total coupons",
  },

  stepReview: {
    title: "Review",
    tokenDetails: "Digital security details",
    serieDetails: "Serie details",
  },

  messages: {
    succes: "Success: ",
    creationSuccessful: "Security creation was successful: ",
    error: "Error: ",
    creationFailed: "Security creation failed",
  },

  cancelSecurityPopUp: {
    title: "You will lose your changes!",
    description:
      "You will lose changes if you go out. Are you sure you want to leave this process?",
    confirmText: "Leave process",
    cancelText: "Cancel",
  },

  createSecurityPopUp: {
    title: "Is everything correct?",
    description:
      "Make sure that all the data is correct. You won't be able to edit it later.",
    confirmText: "Accept",
    cancelText: "Cancel",
  },

  createTokenButton: "Create Bond",
  cancelButton: "Cancel",
  nextStepButton: "Next step",
  previousStepButton: "Previous step",
};
