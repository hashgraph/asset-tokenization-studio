import type { Components } from "react-markdown/src/ast-to-react";
export interface Defaults extends Components {
    heading?: Components["h1"];
}
export declare const defaults: Defaults;
export declare function ChakraUIMarkdownRenderer(theme?: Defaults, merge?: boolean): Components;
