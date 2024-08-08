import React from "react";
import { render } from "@/test-utils";
import { fireEvent } from "@testing-library/react";
import type { DefinitionListProps } from "./DefinitionList";
import { DefinitionList, DefinitionListGrid } from "./index";
import { Box } from "@chakra-ui/react";

const onCopyMock = jest.fn();
jest.mock("@chakra-ui/react", () => ({
  ...jest.requireActual("@chakra-ui/react"),
  useClipboard: jest.fn(() => ({
    hasCopied: false,
    onCopy: onCopyMock,
  })),
}));

const items = [
  {
    title: "List Title",
    description: "List Description",
    canCopy: true,
  },
  {
    title: "List Title 2",
    description: "List Description",
  },
  {
    title: "List Title 3",
    description: "List Description",
  },
  {
    title: "With custom content",
    description: <Box data-testid="custom-content"></Box>,
    valueToCopy: "custom value copied",
    canCopy: true,
  },
];

const defaultProps: DefinitionListProps = {
  title: "List Title",
  items: items,
};

describe(`< ${DefinitionList.name} />`, () => {
  const componentFactory = (props: Partial<DefinitionListProps> = {}) =>
    render(<DefinitionList {...defaultProps} {...props} />);

  test("Should match to snapshot", () => {
    const { container } = componentFactory();
    expect(container).toMatchSnapshot();
  });

  test("Should copy to clipboard", () => {
    const { getByLabelText, getByTestId } = componentFactory();
    const wrapper = getByTestId(`definition-list-item-${items[0].title}`);
    fireEvent.mouseEnter(wrapper);

    const copyButton = getByLabelText(
      `Copy to clipboard-${items[0].description}`
    );
    expect(copyButton).toBeInTheDocument();
    fireEvent.click(copyButton);
    expect(onCopyMock).toBeCalledTimes(1);
  });

  test("Should copy to clipboard custom value", () => {
    const { getByLabelText, getByTestId } = componentFactory();
    const wrapper = getByTestId(`definition-list-item-${items[3].title}`);
    fireEvent.mouseEnter(wrapper);

    const copyButton = getByLabelText(
      `Copy to clipboard-${items[3].valueToCopy}`
    );
    expect(copyButton).toBeInTheDocument();
    fireEvent.click(copyButton);
    expect(onCopyMock).toBeCalledTimes(1);
  });

  test("Should render custom content", () => {
    const { getByTestId } = componentFactory();

    expect(getByTestId("custom-content")).toBeInTheDocument();
  });

  test("Should render with grid", () => {
    const { container } = render(
      <DefinitionListGrid {...defaultProps} columns={2}>
        <DefinitionList {...defaultProps} />
        <DefinitionList {...defaultProps} />
      </DefinitionListGrid>
    );
    expect(container).toMatchSnapshot();
  });

  test("Should render with loading", () => {
    const { container } = componentFactory({ isLoading: true });
    expect(container).toMatchSnapshot("WithLoading");
  });
  test("Should render with loading item", () => {
    const { container } = componentFactory({
      isLoading: true,
      items: [
        ...items,
        {
          title: "List Title",
          description: "List Description",
          isLoading: true,
        },
      ],
    });
    expect(container).toMatchSnapshot("WithLoadingItem");
  });
});
