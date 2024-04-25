import type { StoryFn } from "@storybook/react";
import { Table } from "./Table";
export type SimpleData = {
    name: string;
    dltAddress: string;
    amount: number;
};
declare const meta: import("@storybook/types").ComponentAnnotations<import("@storybook/react/dist/types-0a347bb9").R, import("./Table").TableProps<object>>;
export default meta;
export declare const Template: StoryFn<typeof Table>;
export declare const TemplateSimple: StoryFn<typeof Table>;
export declare const WithLoading: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, import("./Table").TableProps<object>>;
export declare const WithEmptyComponent: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, import("./Table").TableProps<object>>;
export declare const ExpandableTemplate: StoryFn<typeof Table>;
export declare const WithExpandableRow: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, import("./Table").TableProps<object>>;
export declare const WithMultipleExpandableRows: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, import("./Table").TableProps<object>>;
export declare const EditableTemplate: StoryFn<typeof Table>;
export declare const WithEditableCells: import("@storybook/types").AnnotatedStoryFn<import("@storybook/react/dist/types-0a347bb9").R, import("./Table").TableProps<object>>;
