// SPDX-License-Identifier: Apache-2.0

import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar with structured sections
  docsSidebar: [
    "intro",
    {
      type: "category",
      label: "Getting Started",
      collapsed: false,
      link: {
        type: "doc",
        id: "getting-started/index",
      },
      items: [
        "getting-started/ats-quick-start",
        "getting-started/ats",
        "getting-started/mass-payout-quick-start",
        "getting-started/mass-payout",
      ],
    },
    {
      type: "category",
      label: "Guides",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Developer",
          link: {
            type: "generated-index",
            title: "Developer Guides",
            description:
              "Technical guides for developers building on or extending the Asset Tokenization Studio platform.",
            slug: "/guides/developer",
          },
          items: [
            "guides/developer/monorepo-migration",
            "guides/developer/ci-cd-workflows",
            {
              type: "category",
              label: "Contracts",
              link: {
                type: "generated-index",
                title: "Smart Contracts Guides",
                description: "Guides for developing, deploying, and maintaining smart contracts.",
                slug: "/guides/developer/contracts",
              },
              items: [
                {
                  type: "category",
                  label: "ATS Contracts",
                  link: {
                    type: "doc",
                    id: "guides/developer/ats-contracts/index",
                  },
                  items: [
                    "guides/developer/ats-contracts/deployment",
                    "guides/developer/ats-contracts/adding-facets",
                    "guides/developer/ats-contracts/upgrading",
                    "guides/developer/ats-contracts/documenting-contracts",
                  ],
                },
              ],
            },
            {
              type: "category",
              label: "SDK",
              link: {
                type: "generated-index",
                title: "SDK Guides",
                description: "Guides for integrating and using the ATS and Mass Payout SDKs.",
                slug: "/guides/developer/sdk",
              },
              items: [],
            },
            {
              type: "category",
              label: "Web Applications",
              link: {
                type: "generated-index",
                title: "Web Applications Guides",
                description: "Guides for developing and deploying the web applications.",
                slug: "/guides/developer/web",
              },
              items: [],
            },
          ],
        },
        {
          type: "category",
          label: "User",
          link: {
            type: "generated-index",
            title: "User Guides",
            description: "Step-by-step guides for using the Asset Tokenization Studio applications.",
            slug: "/guides/user",
          },
          items: [],
        },
      ],
    },
    {
      type: "category",
      label: "API Documentation",
      link: {
        type: "generated-index",
        title: "API Documentation",
        description: "Auto-generated API documentation for contracts and SDKs.",
        slug: "/api",
      },
      items: [
        {
          type: "category",
          label: "ATS",
          link: {
            type: "generated-index",
            title: "Asset Tokenization Studio API",
            description: "API documentation for ATS contracts and SDK.",
            slug: "/api/ats",
          },
          items: ["api/ats-contracts/index"],
        },
        {
          type: "category",
          label: "Mass Payout",
          link: {
            type: "generated-index",
            title: "Mass Payout API",
            description: "API documentation for Mass Payout contracts and SDK.",
            slug: "/api/mass-payout",
          },
          items: [],
        },
      ],
    },
  ],
};

export default sidebars;
