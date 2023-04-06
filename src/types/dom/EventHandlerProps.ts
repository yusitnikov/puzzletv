import {DOMAttributes, SyntheticEvent} from "react";

export type EventHandlerPropNames = Exclude<keyof DOMAttributes<any>, "children" | "dangerouslySetInnerHTML">;

export type EventHandlerProps<ElemT, KeysT extends EventHandlerPropNames = EventHandlerPropNames> = {
    [K in KeysT]?: DOMAttributes<ElemT>[K];
};

export type NativeEventHandlerProps<KeysT extends EventHandlerPropNames = EventHandlerPropNames> = {
    [K in KeysT]?: (ev: Parameters<Required<EventHandlerProps<any>>[K]>[0]["nativeEvent"]) => void;
};

export const wrapNativeEventHandlerProps = <ElemT, KeysT extends EventHandlerPropNames>(props: NativeEventHandlerProps<KeysT>)
    : Required<EventHandlerProps<ElemT, KeysT>> => Object.fromEntries(Object.entries(props).map(
    ([key, handler]) => [key, (ev: SyntheticEvent<ElemT>) => (handler as any)?.(ev.nativeEvent)]
)) as any;
