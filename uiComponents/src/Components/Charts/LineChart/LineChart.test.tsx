import { render } from "@/test-utils";
import * as echarts from "echarts";
import React from "react";
import { LineChart, type LineChartProps } from "./LineChart";

const data = [
  {
    key: "2/8",
    value: 200,
  },
  {
    key: "2/14",
    value: 340,
  },
  {
    key: "2/18",
    value: 150,
  },
  {
    key: "2/22",
    value: 390,
  },
  {
    key: "2/22",
    value: 250,
  },
  {
    key: "2/24",
    value: 320,
  },
  {
    key: "3/1",
    value: 200,
  },
];

describe(`<LineChart />`, () => {
  const defaultProps: LineChartProps = {
    data,
  };
  let spy: any;
  beforeAll(() => {
    // @ts-ignore
    spy = jest.spyOn(echarts, "getInstanceByDom").mockImplementation(() => {
      return {
        setOption: jest.fn(),
        hideLoading: jest.fn(),
      };
    });
  });

  const factoryComponent = (props: LineChartProps = defaultProps) =>
    render(<LineChart {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent();
    expect(component.asFragment()).toMatchSnapshot();
  });

  afterAll(() => {
    spy.mockRestore();
  });
});
