/**
 * Either callback that returns a value or the value itself
 */
export type CallbackOrValue<ValueT, ArgsT extends any[]> = ValueT | ((...args: ArgsT) => ValueT);

export function resolveCallbackOrValue<ValueT, ArgsT extends any[]>(
    callbackOrValue: CallbackOrValue<ValueT, ArgsT>,
    ...args: ArgsT
): ValueT;
export function resolveCallbackOrValue<ValueT, ArgsT extends any[]>(
    callbackOrValue: CallbackOrValue<ValueT, ArgsT> | undefined,
    ...args: ArgsT
): ValueT | undefined;
export function resolveCallbackOrValue<ValueT, ArgsT extends any[]>(
    callbackOrValue: CallbackOrValue<ValueT, ArgsT> | undefined,
    ...args: ArgsT
): ValueT | undefined {
    return typeof callbackOrValue === "function"
        ? (callbackOrValue as (...args: ArgsT) => ValueT)(...args)
        : callbackOrValue;
}
