import {
  AccordionItemCustomTitle,
  AccordionItemCustomTitleProps,
} from "../AccordionItemCustomTitle";
import { render } from "../../../../test-utils";
import {
  Accordion,
  AccordionItem,
} from "@hashgraph/asset-tokenization-uicomponents/DataDisplay";

const defaultProps = {
  isAdmin: true,
  numOfTokens: 3,
  isExpanded: true,
};

describe(`${AccordionItemCustomTitle.name}`, () => {
  const factoryComponent = (
    props: AccordionItemCustomTitleProps = defaultProps,
  ) =>
    render(
      <Accordion title="">
        <AccordionItem>
          <AccordionItemCustomTitle {...props} />
        </AccordionItem>
      </Accordion>,
    );

  test("should render correctly as admin and expanded", () => {
    const component = factoryComponent();

    const accordionButton = component.getByTestId("custom-title-button");
    expect(accordionButton).toHaveTextContent("Admin");

    expect(component.asFragment).toMatchSnapshot("adminExpanded");
  });

  test("should render correctly as admin and collapsed", () => {
    const component = factoryComponent({ ...defaultProps, isExpanded: false });

    const accordionButton = component.getByTestId("custom-title-button");
    expect(accordionButton).toHaveTextContent("Admin");

    expect(component.asFragment).toMatchSnapshot("adminCollapsed");
  });

  test("should render correctly as holder and expanded", () => {
    const component = factoryComponent({
      ...defaultProps,
      isAdmin: false,
      numOfTokens: 3,
    });

    const accordionButton = component.getByTestId("custom-title-button");
    expect(accordionButton).toHaveTextContent("Holder");

    expect(component.asFragment).toMatchSnapshot("holderExpanded");
  });

  test("should render correctly as holder and collapsed", () => {
    const component = factoryComponent({
      isAdmin: false,
      numOfTokens: 3,
      isExpanded: false,
    });

    const accordionButton = component.getByTestId("custom-title-button");
    expect(accordionButton).toHaveTextContent("Holder");

    expect(component.asFragment).toMatchSnapshot("holderCollapsed");
  });
});
