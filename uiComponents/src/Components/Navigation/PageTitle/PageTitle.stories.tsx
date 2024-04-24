import React from "react";
import { Title, Subtitle, Story } from "@storybook/addon-docs";
import { Link, Flex } from "@chakra-ui/react";

import type { Meta, StoryFn } from "@storybook/react";
import type { PageTitleProps } from "@Components/Navigation/PageTitle";
import { PageTitle } from "@Components/Navigation/PageTitle";

const props: PageTitleProps = {
  title: "Page Title",
  onGoBack: undefined,
};

export default {
  title: "Design System/Navigation/PageTitle",
  component: PageTitle,
  args: {
    isLoading: false,
  },
  parameters: {
    docs: {
      page: () => (
        <>
          <Title>Molecules & Organisms: Navigation</Title>
          <Subtitle>Page Title with back button</Subtitle>

          <Flex margin="50px 0">
            <Story id="design-system-navigation-pagetitle--with-back-button" />
          </Flex>

          <Link
            href="https://www.figma.com/file/YF8AvIq0MclfhGDvKgzypp/NEW---ioBricks-Library?node-id=2091-20098&t=7YJ1vWLNVVuMBa0t-0"
            isExternal
          >
            View figma design
          </Link>
          {/* TODO: fix, now documentation should go in another file */}
          {/* <ArgsTable
            story={CURRENT_SELECTION}
            exclude={[
              "onGoBack",
              "titleProps",
              "_firstLetter",
              "backButtonProps",
            ]}
          /> */}
        </>
      ),
    },
  },
} as Meta<typeof PageTitle>;

const Template: StoryFn<typeof PageTitle> = (args) => <PageTitle {...args} />;

export const WithBackButton = Template.bind({});

WithBackButton.args = {
  ...props,
  onGoBack: () => {
    alert("Go back");
  },
};

export const WithoutBackButton = Template.bind({});

WithoutBackButton.args = {
  ...props,
};

export const WithLoading = Template.bind({});
WithLoading.args = {
  ...props,
  onGoBack: () => {
    alert("Go back");
  },
  isLoading: true,
};
