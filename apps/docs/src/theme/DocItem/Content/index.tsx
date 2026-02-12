// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import Content from "@theme-original/DocItem/Content";
import type ContentType from "@theme/DocItem/Content";
import type { WrapperProps } from "@docusaurus/types";
import styles from "./styles.module.css";

type Props = WrapperProps<typeof ContentType>;

function calculateReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

export default function ContentWrapper(props: Props): React.JSX.Element {
  const [readingTime, setReadingTime] = useState<string | null>(null);

  useEffect(() => {
    // Get the article content after render
    const article = document.querySelector("article");
    if (article) {
      const text = article.textContent || "";
      setReadingTime(calculateReadingTime(text));
    }
  }, []);

  return (
    <>
      {readingTime && (
        <div className={styles.readingTime}>
          <span className={styles.readingTimeIcon}>&#128337;</span>
          <span>{readingTime}</span>
        </div>
      )}
      <Content {...props} />
    </>
  );
}
