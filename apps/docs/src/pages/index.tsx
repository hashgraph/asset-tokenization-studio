// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg margin-right--md"
            to="/ats/getting-started/capabilities-overview"
          >
            Explore ATS
          </Link>
          <Link className="button button--secondary button--lg" to="/mass-payout/getting-started/capabilities-overview">
            Explore Mass Payout
          </Link>
        </div>
      </div>
    </header>
  );
}

function ProductCard({
  title,
  tagline,
  features,
  capabilitiesLink,
  quickStartLink,
}: {
  title: string;
  tagline: string;
  features: string[];
  capabilitiesLink: string;
  quickStartLink: string;
}) {
  return (
    <div className={clsx("col col--6")}>
      <div className={styles.productCard}>
        <Heading as="h2">{title}</Heading>
        <p className={styles.tagline}>{tagline}</p>
        <ul className={styles.featureList}>
          {features.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
        <div className={styles.cardButtons}>
          <Link className="button button--primary button--md" to={capabilitiesLink}>
            View Capabilities
          </Link>
          <Link className="button button--outline button--primary button--md" to={quickStartLink}>
            Quick Start
          </Link>
        </div>
      </div>
    </div>
  );
}

function CapabilitiesTable() {
  const capabilities = [
    { name: "Token Issuance", ats: "Create equity and bond tokens", mp: "—" },
    { name: "Compliance Management", ats: "KYC/AML, allowlists, blocklists", mp: "—" },
    { name: "Corporate Actions", ats: "Dividends, voting, coupons, splits", mp: "—" },
    { name: "Token Operations", ats: "Mint, transfer, redeem, freeze, pause", mp: "—" },
    { name: "Settlement & Clearing", ats: "Holds, escrow, DVP workflows", mp: "—" },
    { name: "Batch Payments", ats: "—", mp: "Pay thousands of holders at once" },
    { name: "Scheduled Distributions", ats: "—", mp: "Automate recurring payouts" },
    { name: "Multi-Currency Payouts", ats: "—", mp: "HBAR or any HTS token" },
    { name: "Payment Tracking", ats: "—", mp: "Real-time monitoring, audit trails" },
    { name: "Role-Based Access", ats: "Minter, Compliance, Controller...", mp: "Payout, Cashout, Pauser..." },
    { name: "Custody Integration", ats: "Dfns, Fireblocks, AWS KMS", mp: "Dfns" },
  ];

  return (
    <section className={styles.tableSection}>
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--lg">
          Platform Capabilities
        </Heading>
        <div className={styles.tableWrapper}>
          <table className={styles.capabilitiesTable}>
            <thead>
              <tr>
                <th>Capability</th>
                <th>ATS</th>
                <th>Mass Payout</th>
              </tr>
            </thead>
            <tbody>
              {capabilities.map((cap, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{cap.name}</strong>
                  </td>
                  <td>{cap.ats}</td>
                  <td>{cap.mp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className={styles.workflowSection}>
      <div className="container">
        <Heading as="h2" className="text--center margin-bottom--lg">
          How They Work Together
        </Heading>
        <div className={styles.workflowSteps}>
          <div className={styles.workflowStep}>
            <span className={styles.stepNumber}>1</span>
            <strong>Create Tokens</strong>
            <span className={styles.stepProduct}>ATS</span>
          </div>
          <div className={styles.workflowArrow}>→</div>
          <div className={styles.workflowStep}>
            <span className={styles.stepNumber}>2</span>
            <strong>Mint to Investors</strong>
            <span className={styles.stepProduct}>ATS</span>
          </div>
          <div className={styles.workflowArrow}>→</div>
          <div className={styles.workflowStep}>
            <span className={styles.stepNumber}>3</span>
            <strong>Import & Sync</strong>
            <span className={styles.stepProduct}>Mass Payout</span>
          </div>
          <div className={styles.workflowArrow}>→</div>
          <div className={styles.workflowStep}>
            <span className={styles.stepNumber}>4</span>
            <strong>Distribute Payments</strong>
            <span className={styles.stepProduct}>Mass Payout</span>
          </div>
        </div>
        <p className="text--center margin-top--lg">
          You can also use each product independently — ATS for token management, or Mass Payout with any existing HTS
          token.
        </p>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Documentation"
      description="Tools for tokenizing financial assets on Hedera network and managing large-scale payout distributions"
    >
      <HomepageHeader />
      <main>
        <section className={styles.productsSection}>
          <div className="container">
            <div className="row">
              <ProductCard
                title="Asset Tokenization Studio (ATS)"
                tagline="Digitize and manage securities on the blockchain with enterprise-grade compliance"
                features={[
                  "Issue equity and bond tokens",
                  "Automate KYC/AML compliance",
                  "Run corporate actions (dividends, voting, coupons)",
                  "Control operations (freeze, pause, forced transfers)",
                  "Settle trades with holds and clearing",
                ]}
                capabilitiesLink="/ats/getting-started/capabilities-overview"
                quickStartLink="/ats/getting-started/quick-start"
              />
              <ProductCard
                title="Mass Payout"
                tagline="Distribute payments to thousands of token holders efficiently and reliably"
                features={[
                  "Pay thousands of holders in one operation",
                  "Schedule recurring distributions",
                  "Pay in HBAR or any HTS token",
                  "Track payments with full audit trail",
                  "Automatic retry for failed payments",
                ]}
                capabilitiesLink="/mass-payout/getting-started/capabilities-overview"
                quickStartLink="/mass-payout/getting-started/quick-start"
              />
            </div>
          </div>
        </section>

        <CapabilitiesTable />
        <WorkflowSection />
      </main>
    </Layout>
  );
}
