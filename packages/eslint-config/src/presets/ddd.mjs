import importX from "eslint-plugin-import-x";

/**
 * DDD layer enforcement for domain-driven packages.
 * Prevents imports that violate domain → application → infrastructure layering.
 */
export default function createDddConfig() {
  return {
    plugins: {
      "import-x": importX,
    },
    settings: {
      "import-x/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ".",
        },
      },
    },
    rules: {
      "import-x/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "src/domain/**",
              from: "src/application/**",
              message: "Domain cannot import from application layer",
            },
            {
              target: "src/domain/**",
              from: "src/infrastructure/**",
              message: "Domain cannot import from infrastructure layer",
            },
            {
              target: "src/application/**",
              from: "src/infrastructure/**",
              message: "Application cannot import from infrastructure layer",
            },
          ],
        },
      ],
    },
  };
}
