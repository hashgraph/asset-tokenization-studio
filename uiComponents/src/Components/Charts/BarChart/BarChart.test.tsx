import { render } from "@/test-utils";
import React from "react";
import { BarChart, type BarChartProps } from "./BarChart";

const data: BarChartProps["data"] = [
  { value: 10 },
  { value: 20 },
  { value: 30 },
  { value: 40 },
  { value: 50 },
  { value: 60 },
  { value: 70 },
  { value: 80 },
];

describe(`<BarChart />`, () => {
  const spacingBars = { spacingBars: "4" };

  const factoryComponent = (props: BarChartProps) =>
    render(<BarChart {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent({ data });
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("renders correctly when spacingBars is passed", () => {
    const component = factoryComponent({ data, ...spacingBars });
    expect(component.asFragment()).toMatchSnapshot("Using spacingBars");
  });

  test("renders correctly when isLoading is passed", () => {
    const component = factoryComponent({ data, isLoading: true });
    expect(component.asFragment()).toMatchSnapshot("Using isLoading");
  });
});
