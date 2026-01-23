// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import { render, waitFor } from "@testing-library/react";
import type { MemoryHistory } from "history";
import { createMemoryHistory } from "history";
import { I18nextProvider } from "react-i18next";
import { Router } from "react-router-dom";
import i18n from "./i18n/config";
import theme from "./theme";
import userEvent from "@testing-library/user-event";

export const selectCalendar = async (
  component: RenderResult,
  id: string,
  day: string | number = new Date().getDate(),
) => {
  const calendar = component.getByTestId(id);
  await userEvent.click(calendar);

  await waitFor(() => {
    const daysToSelect = component.getAllByTestId(`day-${day}`);

    const dayToSelect = daysToSelect.find((day) => !day.hasAttribute("disabled"));

    if (dayToSelect) {
      userEvent.click(dayToSelect);
    }
  });

  await userEvent.click(document.body);
};

export const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnMount: true,
    },
  },
});

export const queryWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
);

const memoryHistory = createMemoryHistory();

export const AllProviders = ({
  children,
  history = memoryHistory,
}: {
  children?: React.ReactNode;
  history?: MemoryHistory;
}) => {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={testQueryClient}>
        <ChakraProvider theme={theme}>
          <Router location={history.location} navigator={history}>
            {children}
          </Router>
        </ChakraProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  {
    options,
    history,
  }: {
    options?: RenderOptions;
    history?: MemoryHistory;
  } = {},
): RenderResult =>
  render(ui, {
    wrapper: ({ children }) => <AllProviders history={history}>{children}</AllProviders>,
    ...options,
  });

export { customRender as render };
