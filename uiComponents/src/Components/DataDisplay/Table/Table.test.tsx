import { render } from "@/test-utils";
import React from "react";
import { Table, type TableProps } from "./Table";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<{
  name: string;
  dltAddress: string;
  amount: number;
}>();

const data = [
  {
    name: "Name 1",
    dltAddress: "12345",
    amount: 23,
  },
  {
    name: "Name 2",
    dltAddress: "54321",
    amount: 53,
  },
];

const columns = [
  columnHelper.accessor("name", {
    header: () => "Name",
    enableSorting: false,
  }),
  columnHelper.accessor("dltAddress", {
    header: () => "Dlt address",
    enableSorting: false,
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    enableSorting: false,
  }),
  columnHelper.display({
    id: "action",
    header: "-",
    size: 55,
    cell: () => <>+</>,
  }),
];
describe(`<Table />`, () => {
  const simpleVariant = { variant: "simple" };

  const factoryComponent = <D extends object>(props: TableProps<D>) =>
    render(<Table {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent({ data, columns, name: "table" });
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("renders correctly with simple variant", () => {
    const component = factoryComponent({
      data,
      columns,
      name: "table",
      ...simpleVariant,
    });
    expect(component.asFragment()).toMatchSnapshot("Using simple variant");
  });

  test("renders correctly with isLoading", () => {
    const component = factoryComponent({
      data,
      columns,
      name: "table",
      isLoading: true,
    });
    expect(component.asFragment()).toMatchSnapshot("Using isLoading");
  });
  test("Should render empty component", () => {
    const component = factoryComponent({
      data: [],
      columns,
      name: "table",
      emptyComponent: <div>Empty</div>,
    });
    expect(component.asFragment()).toMatchSnapshot("Using emptyComponent");
  });
  test("Should no render empty component when data is not empty", () => {
    const component = factoryComponent({
      data,
      columns,
      name: "table",
      emptyComponent: <div>Empty</div>,
    });
    expect(component.asFragment()).toMatchSnapshot(
      "Not render emptyComponent when data is not empty"
    );
  });
  test("Should no render empty component when isLoading is true", () => {
    const component = factoryComponent({
      data: [],
      columns,
      name: "table",
      isLoading: true,
      emptyComponent: <div>Empty</div>,
    });
    expect(component.asFragment()).toMatchSnapshot(
      "Not render emptyComponent when isLoading is true"
    );
  });
});
