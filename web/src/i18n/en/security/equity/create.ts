export default {
  header: {
    title: "Equity creation",
    regulation: "Regulation",
  },

  stepTokenDetails: {
    title: "Create Equity",
    subtitle:
      "Enter the basics details of the digital security to start creating it.",
    mandatoryFields: "*Mandatory fields",
    generalInformation: "General information",
    name: "Name",
    nameTooltip: "Equity’s name.",
    placeholderName: "Enter name",
    symbol: "Symbol",
    symbolTooltip: "Equity’s symbol.",
    placeholderSymbol: "Enter Symbol",
    decimals: "Decimals",
    decimalsTooltip: "Number of decimals units.",
    placeholderDecimals: "6",
    isin: "ISIN",
    isinTooltip: "International security identification number.",
    placeholderIsin: "12",
    tokenPermissions: "Digital security permissions",
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

  stepNewSerie: {
    title: "Specific details",
    subtitle: "Enter the basics details such as currency, type, amount...",
    mandatoryFields: "*Mandatory fields",
    economicInformation: "Economic information",
    nominalValue: "Nominal value",
    nominalValueTooltip:
      "Value of each token of the equity (in the selected currency).",
    currency: "Currency",
    numberOfShares: "Number of shares",
    numberOfSharesTooltip: "Equity’s maximum supply.",
    totalAmount: "Total value",
    totalAmountTooltip:
      "Total tokenized value resulting from multiplying number of shares * nominal value.",
    rightsAndPrivileges: "Rights and privileges",
    votingRights: "Voting rights",
    informationRights: "Information rights",
    liquidationRights: "Liquidation rights",
    preferredDividendsRights: "Preferred dividends rights",
    commonDividendsRights: "Common dividends rights",
    conversionRights: "Conversion rights",
    subscriptionRights: "Subscription rights",
    redemptionRights: "Redemption rights",
    putRights: "Put right",
    dividendType: "Dividend type",
    dividendTypeTooltip:
      "<strong>- None</strong>: Equity holders won’t receive dividends.<br /> <strong>- Preferred</strong>: Equity holders will receive preferred dividends.<br /> <strong>- Common</strong>: Equity holders will receive only common dividends.",
    choosenRights: "Choosen Rights",
    nominalValuePlaceHolder: "Enter nominal value",
  },

  stepReview: {
    title: "Review",
    tokenDetails: "Digital security details",
    configurationDetails: "Configuration details",
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

  createTokenButton: "Create equity",
  cancelButton: "Cancel",
  nextStepButton: "Next step",
  previousStepButton: "Previous step",
};
