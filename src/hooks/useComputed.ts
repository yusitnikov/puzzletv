import {computed, IComputedValueOptions} from "mobx";
import {useCallback, useMemo} from "react";
import {useLastValueRef} from "./useLastValueRef";
import {profiler} from "../utils/profiler";

export const useComputed = <T>(
    func: () => T,
    options?: IComputedValueOptions<T>,
    deps: any[] = [],
) => {
    const funcRef = useLastValueRef(func);

    const comp = useMemo(
        () => computed(
            () => {
                profiler.trace();
                return funcRef.current();
            },
            {
                ...options,
                name: options?.name ?? func.name,
            }
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        deps
    );

    return useCallback(() => comp.get(), [comp]);
};

export const useComputedValue = <T>(
    func: () => T,
    options?: IComputedValueOptions<T>,
    deps: any[] = [],
) => {
    return useComputed(func, options, deps)();
};
