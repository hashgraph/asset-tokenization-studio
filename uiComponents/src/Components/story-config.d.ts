import type { Meta, StoryFn } from "@storybook/react";
import React from "react";
export declare const ThemeStoryWrapper: ({ children, }: {
    children: React.ReactElement | React.ReactElement[];
}) => JSX.Element;
export type StoryMetadata<T> = Meta<T> & {
    template: StoryFn<T>;
};
