import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  referencesSidebar: [
    "index",
    {
      type: "category",
      label: "General Guides",
      items: ["guides/monorepo-migration", "guides/ci-cd-workflows"],
    },
  ],
};

export default sidebars;
