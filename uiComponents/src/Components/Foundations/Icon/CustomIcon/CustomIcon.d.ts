import type { ComponentWithAs } from "@chakra-ui/system";
import type { BaseIconProps } from "@/Components/Foundations/Icon";
export interface CustomIconProps extends BaseIconProps {
    name: string;
}
export declare const CustomIcon: ComponentWithAs<"svg", CustomIconProps>;
