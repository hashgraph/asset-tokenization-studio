import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  atsSidebar: [
    "intro",
    {
      type: "category",
      label: "Getting Started",
      collapsed: false,
      link: {
        type: "doc",
        id: "getting-started/index",
      },
      items: ["getting-started/quick-start", "getting-started/full-setup"],
    },
    {
      type: "category",
      label: "User Guides",
      collapsed: false,
      link: {
        type: "doc",
        id: "user-guides/index",
      },
      items: [
        "user-guides/creating-equity",
        "user-guides/creating-bond",
        "user-guides/managing-compliance",
        "user-guides/corporate-actions",
        "user-guides/token-lifecycle",
      ],
    },
    {
      type: "category",
      label: "Developer Guides",
      collapsed: false,
      link: {
        type: "doc",
        id: "developer-guides/index",
      },
      items: [
        "developer-guides/sdk-integration",
        {
          type: "category",
          label: "Smart Contracts",
          link: {
            type: "doc",
            id: "developer-guides/contracts/index",
          },
          items: [
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
      collapsed: false,
      link: {
        type: "doc",
        id: "api/index",
      },
      items: [
        {
          type: "category",
          label: "Contracts",
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
