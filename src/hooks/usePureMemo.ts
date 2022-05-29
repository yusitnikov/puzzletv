import {DependencyList, useMemo} from "react";

export const usePureMemo = <T>(initialValue: T | (() => T), dependencies?: DependencyList): T => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const usualValue = useMemo<T>(
        typeof initialValue === "function"
            ? initialValue as (() => T)
            : () => (initialValue as T),
        dependencies
    );

    return useMemo(
        () => usualValue,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(usualValue)]
    );
};
