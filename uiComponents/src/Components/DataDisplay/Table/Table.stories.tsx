import { Input } from "@/Components/Forms";
import { ClipboardButton } from "@/Components/Interaction/ClipboardButton";
import { HoverableContent } from "@/Components/Interaction/HoverableContent";
import { IconButton } from "@Components/Interaction/IconButton";
import { Box } from "@chakra-ui/react";
import { Link } from "@phosphor-icons/react";
import type { Meta, StoryFn } from "@storybook/react";
import type { Row, SortingState } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import React, { useState } from "react";
import { Text } from "../../Foundations";
import { PhosphorIcon } from "../../Foundations/PhosphorIcon";
import { Button } from "../../Interaction/Button";
import { Tag } from "../Tag";
import { Table } from "./Table";
import { MultiTextCell } from "./components/MultiTextCell";
import { TableTitle } from "./components/TableTitle";

const date = () => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 30));
  return date.toLocaleString();
};

interface Data {
  type: string;
  price: string;
  fromUser: string;
  toUser: string;
  date: string;
  status: string;
}
const data: Data[] = [
  {
    type: "Sale",
    price: "$200.00",
    fromUser: "@Raymond",
    toUser: "@Jane",
    date: date(),
    status: "BLOCKED",
  },
  {
    type: "Sale",
    price: "$100.00",
    fromUser: "@John",
    toUser: "@Mary",
    date: date(),
    status: "DRAFT",
  },
  {
    type: "Sale",
    price: "$300.00",
    fromUser: "@John",
    toUser: "@Mary",
    date: date(),
    status: "ENABLED",
  },
  {
    type: "Sale",
    price: "$200.00",
    fromUser: "@John",
    toUser: "@Mary",
    date: date(),
    status: "ENABLED",
  },
  {
    type: "Sale long long long text",
    price: "$500.00",
    fromUser: "@John",
    toUser: "@Mary",
    date: date(),
    status: "ENABLED",
  },
];
const columnHelper = createColumnHelper<Data>();

const columns = [
  columnHelper.accessor("type", {}),
  columnHelper.accessor("price", {
    header: () => "Price with IVA",
  }),
  columnHelper.accessor("fromUser", {
    header: "from user",
    enableSorting: false,
    meta: {
      isFocusable: false,
    },
    cell: ({ getValue }) => (
      <HoverableContent hiddenContent={<ClipboardButton value={getValue()} />}>
        {getValue().toUpperCase()}
      </HoverableContent>
    ),
  }),
  columnHelper.accessor("toUser", {
    header: "to user",
    enableSorting: false,
    cell: ({ getValue }) => (
      <MultiTextCell subtext="Text" type="upper" text={getValue()} />
    ),
  }),
  columnHelper.accessor("date", {
    header: "Date",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <Tag size="sm" label={getValue()} />,
  }),
  columnHelper.display({
    id: "action",
    header: "Action",
    cell: (props) => (
      <Button
        size="sm"
        variant="primary"
        onClick={(e) => {
          e.stopPropagation();
          console.log("button clicked");
        }}
      >
        button
      </Button>
    ),
  }),
  columnHelper.display({
    id: "decor",
    header: "-",
    cell: () => <>+</>,
  }),
];

export type SimpleData = {
  name: string;
  dltAddress: string;
  amount: number;
};

const simpleTableColumnHelper = createColumnHelper<SimpleData>();

const dataSimple: SimpleData[] = [
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
const simpleTableColumns = [
  simpleTableColumnHelper.accessor("name", {
    header: () => "Name",
    enableSorting: false,
  }),
  simpleTableColumnHelper.accessor("dltAddress", {
    header: () => "Dlt address",
    enableSorting: false,
  }),
  simpleTableColumnHelper.accessor("amount", {
    header: "Amount",
    enableSorting: false,
  }),
  simpleTableColumnHelper.display({
    id: "action",
    header: "-",
    size: 55,
    cell: () => <>+</>,
  }),
];

const expandableTableColumns = [
  simpleTableColumnHelper.accessor("name", {
    header: () => "Name",
    enableSorting: false,
  }),
  simpleTableColumnHelper.accessor("dltAddress", {
    header: () => "Dlt address",
    enableSorting: false,
  }),
  simpleTableColumnHelper.accessor("amount", {
    header: "Amount",
    enableSorting: false,
  }),
  simpleTableColumnHelper.display({
    id: "action",
    header: "-",
    size: 55,
    cell: () => <>+</>,
  }),
];

const meta = {
  title: "Design System/Data Display/Table",
  component: Table,
  argTypes: {
    variant: {
      options: ["simple", "unstyled", "striped"],
      control: { type: "select" },
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/yn0TWBlB8x5WbsEY8BdML7/Palm-Design-System?node-id=1353%3A10740",
    },
    docs: {},
  },
  args: {
    onClickRow: undefined,
    isLoading: false,
    loadingColumnsCount: 3,
    columns: simpleTableColumns,
    data: dataSimple,
  },
} as Meta<typeof Table>;
export default meta;

export const Template: StoryFn<typeof Table> = (args) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  return (
    <Box p={4} bg="neutral.50">
      <TableTitle
        actions={
          <IconButton
            aria-label="link"
            variant="tertiary"
            size="sm"
            icon={<PhosphorIcon as={Link} />}
          />
        }
      >
        Table Title
      </TableTitle>
      <Table
        size="lg"
        name="table"
        sorting={sorting}
        setSorting={setSorting}
        pagination={pagination}
        totalPages={10}
        totalElements={data.length}
        data={data}
        onClickRow={(data) => console.log("row clicked", data)}
        setPagination={setPagination}
        columns={columns}
      />
    </Box>
  );
};

export const TemplateSimple: StoryFn<typeof Table> = ({ name: _, ...args }) => {
  return (
    <Box maxW="512px" p={4} bg="neutral.50">
      <Table
        size="sm"
        name="table"
        columns={simpleTableColumns}
        data={dataSimple}
        isLoading={args.isLoading}
        loadingColumnsCount={args.loadingColumnsCount}
      />
    </Box>
  );
};

export const WithLoading = TemplateSimple.bind({});

WithLoading.args = {
  isLoading: true,
};

export const WithEmptyComponent = TemplateSimple.bind({});
WithEmptyComponent.args = {
  emptyComponent: <Text>No data found</Text>,
  data: undefined,
  isLoading: false,
};

const RowExpandedContent = ({ row }: { row: Row<SimpleData> }) => {
  return (
    <Box h={20} position={"relative"}>
      <Box position={"absolute"} left={16} top={2}>
        <Text>{row.original.name}</Text>
      </Box>
    </Box>
  );
};

export const ExpandableTemplate: StoryFn<typeof Table> = ({
  name: _,
  ...args
}) => {
  return (
    <Box maxW="512px" p={4} bg="neutral.50">
      <Table
        {...args}
        size="sm"
        name="table"
        columns={expandableTableColumns}
        data={dataSimple}
        enableExpanding
        rowExpandedContent={RowExpandedContent}
      />
    </Box>
  );
};

export const WithExpandableRow = ExpandableTemplate.bind({});
export const WithMultipleExpandableRows = ExpandableTemplate.bind({});
WithMultipleExpandableRows.args = {
  allowMultiExpand: true,
};

const editableTableColumns = [
  columnHelper.accessor("type", {
    header: "Type",
    enableSorting: false,
    cell: (props) => (
      <Input
        size="sm"
        aria-label="Type input"
        defaultValue={props.getValue()}
      />
    ),
  }),
  columnHelper.accessor("price", {
    header: "Price",
    enableSorting: false,
    cell: (props) => (
      <Input
        size="sm"
        aria-label="Price input"
        defaultValue={props.getValue()}
      />
    ),
  }),
];

export const EditableTemplate: StoryFn<typeof Table> = ({
  name: _,
  ...args
}) => {
  const items = [...data];

  return (
    <Box maxW="512px" p={4} bg="neutral.50">
      <Table name="table" data={items} columns={editableTableColumns} />
    </Box>
  );
};

export const WithEditableCells = EditableTemplate.bind({});
