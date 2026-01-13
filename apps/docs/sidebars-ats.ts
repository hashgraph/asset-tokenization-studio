import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  atsSidebar: [
    "intro",
    {
      type: "category",
      label: "Getting Started",
      collapsed: true,
      link: {
        type: "doc",
        id: "getting-started/index",
      },
      items: ["getting-started/quick-start", "getting-started/full-setup"],
    },
    {
      type: "category",
      label: "User Guides",
      collapsed: true,
      link: {
        type: "doc",
        id: "user-guides/index",
      },
      items: [
        "user-guides/creating-equity",
        "user-guides/creating-bond",
        "user-guides/token-operations",
        "user-guides/updating-configuration",
        "user-guides/corporate-actions",
        "user-guides/managing-compliance",
        "user-guides/managing-external-kyc-lists",
        "user-guides/managing-external-control-lists",
        "user-guides/managing-external-pause-lists",
        "user-guides/hold-operations",
        "user-guides/clearing-operations",
        "user-guides/ssi-integration",
        "user-guides/roles-and-permissions",
      ],
    },
    {
      type: "category",
      label: "Developer Guides",
      collapsed: true,
      link: {
        type: "doc",
        id: "developer-guides/index",
      },
      items: [
        {
          type: "category",
          label: "SDK",
          collapsed: true,
          items: ["developer-guides/sdk-integration", "developer-guides/sdk-overview"],
        },
        {
          type: "category",
          label: "Smart Contracts",
          collapsed: true,
          link: {
            type: "doc",
            id: "developer-guides/contracts/index",
          },
          items: [
            "developer-guides/contracts/overview",
            "developer-guides/contracts/deployed-addresses",
            "developer-guides/contracts/deployment",
            "developer-guides/contracts/adding-facets",
            "developer-guides/contracts/upgrading",
            "developer-guides/contracts/documenting-contracts",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "API Documentation",
      collapsed: true,
      link: {
        type: "doc",
        id: "api/index",
      },
      items: [
        "api/sdk-reference",
        {
          type: "category",
          label: "Smart Contracts",
          collapsed: true,
          link: {
            type: "doc",
            id: "api/contracts/index",
          },
          items: [],
        },
      ],
    },
  ],
};

export default sidebars;
