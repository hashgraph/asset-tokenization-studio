// SPDX-License-Identifier: Apache-2.0

const distributionsTranslation = {
  title: "Distributions",
  table: {
    headers: {
      distributionId: "Distribution ID",
      title: "Distributions",
      distributionType: "Distribution Type",
      assetType: "Asset Type",
      assetName: "Asset Name",
      assetId: "Asset ID",
      assetEvmAddress: "Asset EVM Address",
      lifecycleCashFlowId: "Life cycle cash flow ID",
      couponId: "Coupon ID",
      dividendId: "Dividend ID",
      amount: "Amount",
      status: "Status",
      concept: "Concept",
      type: "Type",
      trigger: "Trigger",
      configuratedAmount: "Configured amount",
      distributedAmount: "Distributed amount",
      recipientHolders: "Recipient Holders",
      nextExecutionTime: "Next Execution time",
      executionStartTime: "Execution Start time",
      executionEndTime: "Execution End time",
      actions: "Actions",
      view: "View",
    },
  },
  filters: {
    selectByType: "Select by type",
    searchPlaceholder: "Search assets name, ID...",
    options: {
      allTypes: "All types",
      manual: "Manual",
      corporateAction: "Corporate Action",
    },
  },
  detail: {
    title: "Distribution details",
    tabs: {
      details: "Details",
      holders: "Holders",
    },
    sections: {
      distributionBasicInformation: "Distribution basic information",
      assetDetails: "Asset details",
    },
    fields: {
      distributionId: "ID",
      type: "Type",
      executionDate: "Execution date",
      maturityDate: "Maturity date",
      totalAmount: "Total amount",
      batchCount: "Batch count",
      holders: "Holders",
      assetId: "Asset ID",
      lifecycleCashFlowId: "Lifecycle cash flow ID",
      name: "Name",
      assetType: "Type",
    },
    search: {
      placeholder: "Search wallet address...",
    },
    status: {
      completed: "Completed",
      scheduled: "Scheduled",
      inProgress: "In Progress",
      failed: "Failed",
      cancelled: "Cancelled",
    },
  },
};

export default distributionsTranslation;
