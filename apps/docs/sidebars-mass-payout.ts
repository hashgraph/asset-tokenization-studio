import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  massPayoutSidebar: [
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
        "user-guides/importing-assets",
        "user-guides/creating-distributions",
        "user-guides/managing-payouts",
        "user-guides/scheduled-payouts",
        "user-guides/holders-management",
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
      items: ["developer-guides/contracts/index", "developer-guides/sdk-integration", "developer-guides/backend/index"],
    },
    {
      type: "category",
      label: "API Documentation",
      collapsed: true,
      link: {
        type: "doc",
        id: "api/index",
      },
      items: ["api/rest-api/index"],
    },
  ],
};

export default sidebars;
