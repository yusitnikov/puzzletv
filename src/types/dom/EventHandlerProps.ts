import {DOMAttributes} from "react";

export type EventHandlerPropNames = Exclude<keyof DOMAttributes<any>, "children" | "dangerouslySetInnerHTML">;

export type EventHandlerProps<ElemT, KeysT extends EventHandlerPropNames = EventHandlerPropNames> = {
    [K in KeysT]?: DOMAttributes<ElemT>[K];
};
