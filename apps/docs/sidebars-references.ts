import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  referencesSidebar: [
    "index",
    {
      type: "category",
      label: "Architecture Decision Records",
      link: {
        type: "doc",
        id: "adr/index",
      },
      items: ["adr/0001-adopt-docs-as-code-philosophy"],
    },
    {
      type: "category",
      label: "Enhancement Proposals",
      link: {
        type: "doc",
        id: "proposals/index",
      },
      items: [],
    },
    {
      type: "category",
      label: "General Guides",
      items: ["guides/monorepo-migration", "guides/ci-cd-workflows"],
    },
  ],
};

export default sidebars;
