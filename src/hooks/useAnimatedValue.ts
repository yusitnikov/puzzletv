import {useEffect, useState} from "react";
import {useRafValue} from "./useRaf";

export const useAnimatedValue = (targetValue: number, animationTime: number) => {
    const now = Date.now();

    const [{lastStartValue, lastTargetValue, lastStartTime, lastAnimationTime}, setLastState] = useState({
        lastStartValue: targetValue,
        lastTargetValue: targetValue,
        lastStartTime: now,
        lastAnimationTime: animationTime,
    });

    const coeff = lastAnimationTime ? Math.min((now - lastStartTime) / lastAnimationTime, 1) : 1;
    const value = lastStartValue + (lastTargetValue - lastStartValue) * coeff;

    useEffect(
        () => setLastState({
            lastStartValue: value,
            lastTargetValue: targetValue,
            lastStartTime: now,
            lastAnimationTime: animationTime,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [targetValue, animationTime]
    );

    return useRafValue(value);
};
