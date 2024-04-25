/// <reference types="react" />
export type StepStatusType = "active" | "complete" | "incomplete";
export type Orientation = "horizontal" | "vertical";
export interface StepContext {
    status: StepStatusType;
    count: number;
    index: number;
    orientation: Orientation;
    isLast: boolean;
    isFirst: boolean;
    goToNext?(): void;
    goToPrevious?(): void;
    setActiveStep?: React.Dispatch<React.SetStateAction<number>>;
}
export declare const StepContextProvider: import("react").Provider<StepContext>, useStepContext: () => StepContext;
