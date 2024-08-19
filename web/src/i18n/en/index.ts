import routes from "./routes";
import landing from "./landing";
import dashboard from "./dashboard";
import rules from "./rules";
import security from "./security";
import initialization from "./initialization";

export default {
  globals: {
    iob: "IO Builders",
    tag: "Proof of concept",
    connectMetamask: "Connect Metamask",
    connectHashpack: "Connect Hashpack",
    walletChanged: "Wallet was changed to {{ currentWallet }}",
    networkChanged: "Network changed to {{ currentNetwork }}",
    unrecognizedNetwork: "Changed to an unrecognized network",
    changeToRecognizedNetwork:
      "Metamask is not connected to the Hedera Testnet. Please follow the instructions at the landing page to configure your wallet",
    changeToHederaAccount:
      "The selected Account in Metamask is not a Hedera account. Please follow the instructions at the landing page to configure your Hedera account and your wallet.",
    cancel: "Cancel",
    holder: "Holder",
    admin: "Admin",
    general: "General",
    seeAll: "See all",
    securities: "securities",
    quantityOfSecurities: "{{ numOfTokens }} securities",
    walletDisconnect: "Disconnect Wallet",
    mandatoryFields: "*Mandatory fields",
    accept: "Accept",
    submit: "Submit",
    send: "Send",
    tokenDetails: "Token details",
    check: " Check",
    error: "The operation has failed",
    mobile: {
      message: "This app is for desktop use only",
    },
  },
  properties: {
    type: "Type",
    name: "Name",
    symbol: "Symbol",
    decimal: "Decimal",
    isin: "ISIN",
    id: "ID",
    totalSupply: "Total Supply",
    maxSupply: "Max Supply",
    pendingToBeMinted: "Pending to be minted",
    accountBalance: "Account Balance",
    currentAvailableBalance: "Current Available balance",
    overallBalance: "Overall balance",
    tokenSymbol: "TOK",
    value: "Value",
    status: "Status",
    address: "Address",
    currency: "Currency",
    nominalValue: "Nominal Value",
    nominalTotalValue: "Value: $",
    permissions: {
      label: "Permissions",
      controllable: "Controllable",
      blocklist: "Blocklist",
      approvalList: "Approval list",
      allowed: "Allowed",
      notAllowed: "Not allowed",
      rightsAndPrivileges: "Rights and privileges",
    },
    copyId: "*Copy and save the ID to import into other browsers.",
    regulations: {
      label: "Regulations",
      regulationType: "Regulation type",
      regulationSubType: "Regulation sub-type",
      allowedCountries: "Allowed countries",
      blockedCountries: "Blocked countries",
      dealSize: "Deal size",
      dealSizePlaceHolder: "Can raise unlimited capital",
      accreditedInvestors: "Accredited investors",
      maxNonAccreditedInvestors: "Max non-accredited investors",
      maxNonAccreditedInvestorsPlaceHolder: "Unlimited",
      manualInvestorVerification: "Manual investor verification",
      internationalInvestors: "International investors",
      resaleHoldPeriod: "Resale hold period",
    },
  },
  roles: {
    admin: "Admin role",
    minter: "Minter role",
    controller: "Controller role",
    pause: "Pause role",
    controlList: "Control List role",
    corporateActions: "Corporate actions role",
    document: "Document role",
    snapshot: "Snapshot role",
  },
  landing,
  routes,
  dashboard,
  rules,
  security,
  initialization,
};
