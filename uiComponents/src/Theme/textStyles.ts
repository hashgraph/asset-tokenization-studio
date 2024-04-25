/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SystemStyleObject } from "@chakra-ui/react";
import _startCase from "lodash/startCase";

enum Typography {
  Body = "Body",
  Heading = "Heading",
  Elements = "Elements",
}

enum Variant {
  Light = "light",
  Regular = "regular",
  Medium = "medium",
  Semibold = "semibold",
  Bold = "bold",
}

enum Size {
  XS = "XS",
  SM = "SM",
  MD = "MD",
  LG = "LG",
  XL = "XL",
  "2XL" = "2XL",
}

const variantStyles: Record<Variant, SystemStyleObject> = {
  light: {
    fontFamily: "light",
    fontWeight: "light",
  },
  regular: {
    fontFamily: "regular",
    fontWeight: "normal",
  },
  medium: {
    fontFamily: "medium",
    fontWeight: "medium",
  },
  semibold: {
    fontFamily: "semiBold",
    fontWeight: "semibold",
  },
  bold: {
    fontFamily: "bold",
    fontWeight: "bold",
  },
};

const generateStyles = ({
  sizes,
  type,
  variants,
}: {
  sizes: Array<{ size: Size; style: SystemStyleObject }>;
  variants: Array<Variant>;
  type: Typography;
}) => {
  return sizes.reduce((prev, curr) => {
    const variantsStyles = variants.reduce(
      (prev, variant) => ({
        ...prev,
        [`${type}${_startCase(variant)}${curr.size}`]: {
          ...curr.style,
          ...variantStyles[variant],
        },
      }),
      {}
    );

    return {
      ...prev,
      ...variantsStyles,
    };
  }, {});
};

const bodySizes = [
  { size: Size.LG, style: { fontSize: "xl", lineHeight: "3xl" } },
  { size: Size.MD, style: { fontSize: "md", lineHeight: "2xl" } },
  { size: Size.SM, style: { fontSize: "sm", lineHeight: "xl" } },
  {
    size: Size.XS,
    style: { fontSize: "xs", lineHeight: "md" },
  },
];

const elementSizes = [
  { size: Size["2XL"], style: { fontSize: "4xl", lineHeight: "7xl" } },
  { size: Size.XL, style: { fontSize: "2xl", lineHeight: "4xl" } },
  { size: Size.LG, style: { fontSize: "xl", lineHeight: "3xl" } },
  { size: Size.MD, style: { fontSize: "md", lineHeight: "2xl" } },
  { size: Size.SM, style: { fontSize: "sm", lineHeight: "xl" } },
  {
    size: Size.XS,
    style: { fontSize: "xs", lineHeight: "md" },
  },
];

const headingSizes = [
  {
    size: Size.XL,
    style: {
      fontSize: "2xl",
      lineHeight: "4xl",
    },
  },
  {
    size: Size.LG,
    style: {
      fontSize: "xl",
      lineHeight: "3xl",
    },
  },
  {
    size: Size.MD,
    style: {
      fontSize: "md",
      lineHeight: "2xl",
    },
  },
  {
    size: Size.SM,
    style: {
      fontSize: "sm",
      lineHeight: "xl",
    },
  },
  {
    size: Size.XS,
    style: {
      fontSize: "xs",
      lineHeight: "md",
    },
  },
];

export const textStyles: Record<string, SystemStyleObject> = {
  ...generateStyles({
    sizes: bodySizes,
    variants: [Variant.Medium, Variant.Regular, Variant.Bold, Variant.Semibold],
    type: Typography.Body,
  }),
  ...generateStyles({
    sizes: elementSizes,
    variants: [
      Variant.Light,
      Variant.Regular,
      Variant.Medium,
      Variant.Semibold,
      Variant.Bold,
    ],
    type: Typography.Elements,
  }),
  ...generateStyles({
    sizes: headingSizes,
    variants: [Variant.Regular, Variant.Medium, Variant.Semibold, Variant.Bold],
    type: Typography.Heading,
  }),
};
