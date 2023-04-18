import {useEffect, useState} from "react";
import {useRafValue} from "./useRaf";

export const mixAnimatedValue = (a: number, b: number, coeff: number) => a + (b - a) * Math.max(0, Math.min(1, coeff));

export function useAnimatedValue(targetValue: number, animationTime: number): number;
export function useAnimatedValue<T>(targetValue: T, animationTime: number, valueMixer: (a: T, b: T, coeff: number) => T): T;
export function useAnimatedValue<T>(
    targetValue: T,
    animationTime: number,
    valueMixer: (a: T, b: T, coeff: number) => T = mixAnimatedValue as any
): T {
    const now = Date.now();

    const [{lastStartValue, lastTargetValue, lastStartTime, lastAnimationTime}, setLastState] = useState({
        lastStartValue: targetValue,
        lastTargetValue: targetValue,
        lastStartTime: now,
        lastAnimationTime: animationTime,
    });

    const coeff = lastAnimationTime ? Math.min((now - lastStartTime) / lastAnimationTime, 1) : 1;
    const value = valueMixer(lastStartValue, lastTargetValue, coeff);

    useEffect(
        () => setLastState({
            lastStartValue: value,
            lastTargetValue: targetValue,
            lastStartTime: now,
            lastAnimationTime: animationTime,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(targetValue), animationTime]
    );

    return useRafValue(value);
}
