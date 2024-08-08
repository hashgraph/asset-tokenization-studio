import { render } from "@testing-library/react";
import React from "react";
import { Avatar, type AvatarProps } from "./Avatar";

describe(`<Avatar />`, () => {
  const showBadge = true;
  const badgeColor = "red.500";
  const name = "John Doe";
  const src = "https://placekitten.com/200/200";
  const size2xs = { size: "2xs" };
  const sizeXs = { size: "xs" };
  const sizeSm = { size: "sm" };
  const sizeMd = { size: "md" };
  const sizeLg = { size: "lg" };
  const sizeXl = { size: "xl" };
  const size2Xl = { size: "2xl" };
  const size3Xl = { size: "3xl" };
  const factoryComponent = (props: AvatarProps) =>
    render(<Avatar {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent({});
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("renders correctly with size 2xs", () => {
    const component = factoryComponent(size2xs);
    expect(component.asFragment()).toMatchSnapshot("Using size 2xs");
  });
  test("renders correctly with size xs", () => {
    const component = factoryComponent(sizeXs);
    expect(component.asFragment()).toMatchSnapshot("Using size xs");
  });
  test("renders correctly with size sm", () => {
    const component = factoryComponent(sizeSm);
    expect(component.asFragment()).toMatchSnapshot("Using size sm");
  });
  test("renders correctly with size md", () => {
    const component = factoryComponent(sizeMd);
    expect(component.asFragment()).toMatchSnapshot("Using size md");
  });
  test("renders correctly with size lg", () => {
    const component = factoryComponent(sizeLg);
    expect(component.asFragment()).toMatchSnapshot("Using size lg");
  });
  test("renders correctly with size xl", () => {
    const component = factoryComponent(sizeXl);
    expect(component.asFragment()).toMatchSnapshot("Using size xl");
  });

  test("renders correctly with size 2xl", () => {
    const component = factoryComponent(size2Xl);
    expect(component.asFragment()).toMatchSnapshot("Using size 2xl");
  });

  test("renders correctly with size 3xl", () => {
    const component = factoryComponent(size3Xl);
    expect(component.asFragment()).toMatchSnapshot("Using size 3xl");
  });

  test("renders correctly with initials", () => {
    const component = factoryComponent({ name });
    expect(component.asFragment()).toMatchSnapshot("Using initials");
  });

  test("renders correctly with image", () => {
    const component = factoryComponent({ src });
    expect(component.asFragment()).toMatchSnapshot("Using image");
  });
  test("renders correctly with badge default color", () => {
    const component = factoryComponent({ showBadge });
    expect(component.asFragment()).toMatchSnapshot("Using badge default color");
  });

  test("renders correctly with badge custom color", () => {
    const component = factoryComponent({ showBadge, badgeColor });
    expect(component.asFragment()).toMatchSnapshot("Using badge custom color");
  });

  test("renders correctly with initials and badge default color", () => {
    const component = factoryComponent({ name, showBadge });
    expect(component.asFragment()).toMatchSnapshot(
      "Using initials and badge default color"
    );
  });

  test("renders correctly with initials and badge custom color", () => {
    const component = factoryComponent({ name, showBadge, badgeColor });
    expect(component.asFragment()).toMatchSnapshot(
      "Using initials and badge custom color"
    );
  });

  test("renders correctly with image and badge default color", () => {
    const component = factoryComponent({ src, showBadge });
    expect(component.asFragment()).toMatchSnapshot(
      "Using image and badge default color"
    );
  });

  test("renders correctly with image and badge custom color", () => {
    const component = factoryComponent({ src, showBadge, badgeColor });
    expect(component.asFragment()).toMatchSnapshot(
      "Using image and badge custom color"
    );
  });

  test("renders correctly with isLoading", () => {
    const component = factoryComponent({ isLoading: true });
    expect(component.asFragment()).toMatchSnapshot("Using isLoading");
  });
});
