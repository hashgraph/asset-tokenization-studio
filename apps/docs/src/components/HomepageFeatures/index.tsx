import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Asset Tokenization Studio",
    icon: "🪙",
    description: (
      <>
        Create and manage security tokens (equities and bonds) compliant with ERC-1400 and ERC-3643 standards on Hedera
        network. Diamond pattern architecture for upgradeable, modular smart contracts.
      </>
    ),
  },
  {
    title: "Mass Payout Distribution",
    icon: "💸",
    description: (
      <>
        Execute large-scale batch payments for dividends, coupons, and recurring obligations. Automated distribution
        with snapshot management and comprehensive tracking.
      </>
    ),
  },
  {
    title: "Open Source & Docs-as-Code",
    icon: "📚",
    description: (
      <>
        Transparent documentation living with the code. Comprehensive guides and API references enable community
        contribution and seamless integration.
      </>
    ),
  },
];

function Feature({ title, icon, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <span style={{ fontSize: "4rem" }} role="img" aria-label={title}>
          {icon}
        </span>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
