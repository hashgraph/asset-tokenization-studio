// SPDX-License-Identifier: Apache-2.0

const importAssetTranslation = {
  title: "Asset import",
  header: {
    details: "Select an asset",
    review: "Review and Confirm",
  },
  details: {
    title: "Asset Configuration",
    subtitle: "Enter the asset ID.",
    assetInfo: "Asset Info",
    assetName: "Asset Name: <bold>{{name}}</bold>",
    symbol: "Symbol: <bold>{{symbol}}</bold>",
    assetType: "Asset Type: <bold>{{type}}</bold>",
    description:
      "*Importing this asset enables automated mass payouts for lifecycle management , including corporate actions (e.g., coupon payments, redemptions) and configurable triggers (e.g., manual, scheduled, or streaming). To activate this functionality, the Distributions contract must be granted the necessary permissions on the Asset Smart Contract. Configurations can be reviewed and adjusted in the next step before finalization.",
  },
  stepAssetDetails: {
    assetId: "Asset ID",
    assetName: "Name",
    lifeCycleCashFlowId: "Life Cycle Cash Flow ID",
    type: "Type",
    symbol: "Symbol",
  },
  form: {
    assetId: {
      label: "Asset ID",
      placeholder: "0.0.XXXXXX",
      required: "Asset ID is required",
    },
    assetName: {
      label: "Asset name",
      placeholder: "[Asset name]",
      required: "Asset name is required",
    },
  },
  buttons: {
    cancel: "Cancel",
    nextStep: "Next step",
    previousStep: "Previous step",
    importAsset: "Import Asset",
    importing: "Importing...",
  },
  review: {
    assetConfiguration: "Asset configuration",
    title: "Review Asset Details",
    assetId: "Asset ID",
    assetName: "Asset Name",
  },
};

export default importAssetTranslation;
