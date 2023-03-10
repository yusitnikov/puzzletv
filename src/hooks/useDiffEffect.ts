import {useEffect, useRef} from "react";
import {useLastValueRef} from "./useLastValueRef";

export const useDiffEffect = <T extends Array<any>>(callback: (prevDependencies: T | []) => void, dependencies: T): void => {
    const dependenciesRef = useRef<T | []>([]);

    const callbackRef = useLastValueRef(callback);

    useEffect(
        () => {
            callbackRef.current(dependenciesRef.current || []);

            dependenciesRef.current = dependencies;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        dependencies
    );
};
