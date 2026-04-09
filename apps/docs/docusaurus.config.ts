// SPDX-License-Identifier: Apache-2.0

import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Asset Tokenization Studio",
  tagline: "Tools for tokenizing financial assets on Hedera network and managing large-scale payout distributions",
  favicon: "img/favicon.svg",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://hashgraph.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  // For Netlify deploymenent, it is often '/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "hashgraph", // Usually your GitHub org/user name.
  projectName: "asset-tokenization-studio", // Usually your repo name.

  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: false, // Disable default docs plugin
        blog: false, // Blog disabled
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "ats",
        path: "../../docs/ats",
        routeBasePath: "ats",
        sidebarPath: "./sidebars-ats.ts",
        editUrl: "https://github.com/hashgraph/asset-tokenization-studio/tree/main/",
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "mass-payout",
        path: "../../docs/mass-payout",
        routeBasePath: "mass-payout",
        sidebarPath: "./sidebars-mass-payout.ts",
        editUrl: "https://github.com/hashgraph/asset-tokenization-studio/tree/main/",
      },
    ],
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "references",
        path: "../../docs/references",
        routeBasePath: "references",
        sidebarPath: "./sidebars-references.ts",
        editUrl: "https://github.com/hashgraph/asset-tokenization-studio/tree/main/",
      },
    ],
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
        language: ["en"],
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        docsPluginIdForPreferredVersion: "ats",
        docsRouteBasePath: ["/ats", "/mass-payout", "/references"],
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
        searchResultContextMaxLength: 50,
      },
    ],
  ],

  markdown: {
    mermaid: true,
  },

  themes: ["@docusaurus/theme-mermaid"],

  themeConfig: {
    // Social card for link previews (optional)
    // image: 'img/social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Asset Tokenization Studio",
      logo: {
        alt: "Asset Tokenization Studio Logo",
        src: "img/logo.svg",
        srcDark: "img/logo-dark.svg",
      },
      items: [
        {
          type: "doc",
          docId: "intro",
          docsPluginId: "ats",
          position: "left",
          label: "ATS",
        },
        {
          type: "doc",
          docId: "intro",
          docsPluginId: "mass-payout",
          position: "left",
          label: "Mass Payout",
        },
        {
          type: "doc",
          docId: "index",
          docsPluginId: "references",
          position: "left",
          label: "References",
        },
        {
          href: "https://github.com/hashgraph/asset-tokenization-studio",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "ATS Getting Started",
              to: "/ats/getting-started/quick-start",
            },
            {
              label: "MP Getting Started",
              to: "/mass-payout/getting-started/quick-start",
            },
          ],
        },
        {
          title: "Products",
          items: [
            {
              label: "Asset Tokenization Studio",
              href: "https://github.com/hashgraph/asset-tokenization-studio/tree/main/packages/ats",
            },
            {
              label: "Mass Payout",
              href: "https://github.com/hashgraph/asset-tokenization-studio/tree/main/packages/mass-payout",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/hashgraph/asset-tokenization-studio",
            },
            {
              label: "Issues",
              href: "https://github.com/hashgraph/asset-tokenization-studio/issues",
            },
            {
              label: "Contributing",
              href: "https://github.com/hashgraph/asset-tokenization-studio/blob/main/CONTRIBUTING.md",
            },
          ],
        },
        {
          title: "Hedera",
          items: [
            {
              label: "Hedera Network",
              href: "https://hedera.com",
            },
            {
              label: "Hedera Docs",
              href: "https://docs.hedera.com",
            },
            {
              label: "Hedera Portal",
              href: "https://portal.hedera.com",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Hedera Hashgraph, LLC. Licensed under Apache License 2.0.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
