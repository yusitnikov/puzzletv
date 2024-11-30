import { EventHandlerProps } from "../types/dom/EventHandlerProps";

export const mergeEventHandlerProps = <T>(...args: EventHandlerProps<T>[]): EventHandlerProps<T> => {
    const result: EventHandlerProps<T> = {};

    for (const arg of args) {
        for (const key in arg) {
            // @ts-ignore
            result[key] = ((prev: any, current: any): any => {
                if (typeof prev !== "function" || typeof current !== "function") {
                    return current ?? prev;
                } else {
                    return (...args: any[]) => {
                        prev(...args);
                        current(...args);
                    };
                }
                // @ts-ignore
            })(result[key], arg[key]);
        }
    }

    return result;
};
