import { useCallback, useEffect, useState } from "react";
import { useLastValueRef } from "./useLastValueRef";

export const useThrottle = (timeout: number, callback?: () => void) => {
    const [, setTimeout] = useState(0);

    const callbackRef = useLastValueRef(callback);

    return useCallback(
        (customCallback?: () => void) =>
            setTimeout((prevTimeout) => {
                if (prevTimeout) {
                    window.clearTimeout(prevTimeout);
                }

                return window.setTimeout(() => {
                    callbackRef.current?.();
                    customCallback?.();
                }, timeout);
            }),
        [timeout, setTimeout, callbackRef],
    );
};

export const useThrottleData = <T>(timeout: number, data: T): T => {
    const [throttledData, setThrottledData] = useState(data);

    const throttledSetData = useThrottle(timeout, () => setThrottledData(data));

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(throttledSetData, [data]);

    return throttledData;
};
