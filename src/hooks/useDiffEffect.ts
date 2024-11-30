import { useEffect, useRef } from "react";
import { useLastValueRef } from "./useLastValueRef";

export const useDiffEffect = <T extends Array<any>>(
    callback: (prevDependencies: T | [], currentDependencies: T | []) => void,
    dependencies: T,
): void => {
    const dependenciesRef = useRef<T | []>([]);

    const callbackRef = useLastValueRef(callback);

    useEffect(
        () => {
            callbackRef.current(dependenciesRef.current || [], dependencies);

            dependenciesRef.current = dependencies;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        dependencies,
    );

    useEffect(() => {
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            callbackRef.current(dependenciesRef.current || [], []);
        };
    }, [callbackRef, dependenciesRef]);
};
