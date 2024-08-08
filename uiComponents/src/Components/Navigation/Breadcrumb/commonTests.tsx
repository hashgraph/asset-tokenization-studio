import React from "react";
import type { BreadcrumbProps } from "./Breadcrumb";

export const defaultProps: BreadcrumbProps = {
  items: [
    {
      label: "Level 0",
      link: "/",
    },
    {
      label: "Level 1",
      link: "/level1",
    },
    {
      label: "Level 2",
      link: "/level1/level2",
    },
    {
      label: "Level 3",
      link: "/level1/level2/level3",
    },
    {
      label: "Level 4",
      link: "/level1/level2/level3/level4",
    },
    {
      label: "Level 5",
      link: "/level1/level2/level3/level4/level5",
    },
    {
      label: "Level 6",
      link: "http://www.google.com",
    },
    {
      label: "Level 7",
      link: "/level1/level2/level3/level4/level5/level6/level7",
    },
    {
      label: "Level 8",
      link: null,
    },
  ],
  showMaxItems: false,
};

export const CustomLink = ({
  children,
  ...props
}: {
  children: React.ReactNode;
}) => {
  return (
    <a {...props} style={{ color: "blue", fontSize: "24px" }}>
      {children}
    </a>
  );
};

export const customProps: BreadcrumbProps = {
  items: [
    {
      label: "Level 0",
      link: {
        as: CustomLink,
        "data-testid": "custom-link-0",
        href: "/level0",
      },
    },
    {
      label: "Level 1",
      link: {
        as: CustomLink,
        "data-testid": "custom-link-1",
        href: "/level1",
      },
    },
    {
      label: "Level 2",
      link: {
        as: CustomLink,
        "data-testid": "custom-link-2",
        href: "/level2",
      },
    },
    {
      label: "Level 3",
      link: {
        as: CustomLink,
        "data-testid": "custom-link-3",
        href: "/level3",
      },
    },
    {
      label: "Level 4",
      link: {
        as: CustomLink,
        "data-testid": "custom-link-4",
        href: "/level4",
      },
    },
    {
      label: "Level 5",
      link: {
        as: CustomLink,
        "data-testid": "custom-link-5",
        href: "/level5",
      },
    },
    {
      label: "Level 6",
      link: {
        as: CustomLink,
        "data-testid": "custom-link-6",
        href: "/level6",
      },
    },
    {
      label: "Level 7",
      link: {
        as: CustomLink,
        "data-testid": "custom-link-7",
        href: "http://www.google.com",
      },
    },
    {
      label: "Level 8",
      link: {
        as: CustomLink,
        "data-testid": "custom-link-8",
      },
    },
  ],
  showMaxItems: true,
};
