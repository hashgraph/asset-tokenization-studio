import { render } from "@/test-utils";
import React from "react";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { Plus, DotsThree } from "@phosphor-icons/react";
import type { TagProps } from "./Tag";
import { Tag } from "./Tag";

describe(`<Tag />`, () => {
  const label: TagProps["label"] = "Tag";
  const iconLeftProp = <PhosphorIcon as={Plus} />;
  const iconRightProp = <PhosphorIcon as={DotsThree} />;

  const sizeSmallProp = { size: "sm" };
  const sizeLargeProp = { size: "lg" };
  const solidVariantProp = { variant: "solid" };
  const outlineVariantProp = { variant: "outline" };

  const factoryComponent = (props: TagProps) => render(<Tag {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent({ label });
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("shows icon on left side", () => {
    const component = factoryComponent({ icon: iconLeftProp, label });
    expect(component.asFragment()).toMatchSnapshot("Using icon left");
  });

  test("shows icon on right side", () => {
    const component = factoryComponent({ icon: iconRightProp, label });
    expect(component.asFragment()).toMatchSnapshot("Using icon right");
  });

  test("shows small size", () => {
    const component = factoryComponent({ label, ...sizeSmallProp });
    expect(component.asFragment()).toMatchSnapshot("Using size small");
  });

  test("shows large size", () => {
    const component = factoryComponent({ label, ...sizeLargeProp });
    expect(component.asFragment()).toMatchSnapshot("Using size large");
  });

  test("shows solid variant", () => {
    const component = factoryComponent({ label, ...solidVariantProp });
    expect(component.asFragment()).toMatchSnapshot("Using variant solid");
  });

  test("shows outline variant", () => {
    const component = factoryComponent({ label, ...outlineVariantProp });
    expect(component.asFragment()).toMatchSnapshot("Using variant outline");
  });

  test("shows skeleton when isLoading is true", () => {
    const component = factoryComponent({ label, isLoading: true });
    expect(component.asFragment()).toMatchSnapshot("WithLoading");
  });
});
