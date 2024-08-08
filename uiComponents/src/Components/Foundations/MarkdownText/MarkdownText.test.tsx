import { render } from "@/test-utils";
import React from "react";
import { Text } from "../Text";
import type { MarkdownTextProps } from "./MarkdownText";
import { MarkdownText } from "./MarkdownText";

describe(`<MarkdownText />`, () => {
  const children = `# h1 Heading 8-) 
  ## h2 Heading
  ### h3 Heading
  #### h4 Heading
  ##### h5 Heading
  ###### h6 Heading
  Simple paragraph
  `;

  const defaultProps: MarkdownTextProps = {
    children,
    theme: {
      p: (props) => <Text color="blue">{props.children}</Text>,
    },
  };

  const factoryComponent = (props: MarkdownTextProps) =>
    render(<MarkdownText {...props} />);

  test("renders correctly", () => {
    const component = factoryComponent({ ...defaultProps });
    expect(component.asFragment()).toMatchSnapshot();
  });
});
