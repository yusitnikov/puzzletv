import {useEffect, useState} from "react";
import {rafTime} from "./useRaf";
import {comparer, computed, makeAutoObservable} from "mobx";
import {useLastValueRef} from "./useLastValueRef";
import {profiler} from "../utils/profiler";

export type AnimatedValueMixer<T> = (a: T, b: T, coeff: number) => T;

export const mixAnimatedValue: AnimatedValueMixer<number> = (a, b, coeff) => a + (b - a) * Math.max(0, Math.min(1, coeff));

export class AnimatedValue<T> {
    private startValue: T;
    private targetValue: T;
    private startTime: number;
    private animationTime: number;

    constructor(
        targetValue: T,
        animationTime: number,
        private valueMixer: AnimatedValueMixer<T> = mixAnimatedValue as any,
    ) {
        makeAutoObservable<this, "valueMixer">(this, {
            valueMixer: false,
            finalValue: false,
            animatedValue: computed({equals: comparer.structural}),
        });

        this.startValue = targetValue;
        this.targetValue = targetValue;
        this.startTime = rafTime();
        this.animationTime = animationTime;
    }

    private get coeff() {
        return this.animationTime ? Math.min((rafTime() - this.startTime) / this.animationTime, 1) : 1;
    }

    get finalValue() {
        return this.targetValue;
    }

    get animatedValue() {
        profiler.trace();
        return this.valueMixer(this.startValue, this.targetValue, this.coeff);
    }

    get isAnimating() {
        profiler.trace();
        return this.coeff < 1;
    }

    update(targetValue: T, animationTime: number) {
        // The calculation of this.value must happen before updating any other values!
        this.startValue = this.animatedValue;

        this.targetValue = targetValue;
        this.animationTime = animationTime;
        this.startTime = rafTime();
    }
}

export function useAnimatedValue(targetValue: number, animationTime: number): number;
export function useAnimatedValue<T>(targetValue: T, animationTime: number, valueMixer: AnimatedValueMixer<T>): T;
export function useAnimatedValue<T>(
    targetValue: T,
    animationTime: number,
    valueMixer: AnimatedValueMixer<T> = mixAnimatedValue as any
): T {
    const valueMixerRef = useLastValueRef(valueMixer);

    const [manager] = useState(() => new AnimatedValue(
        targetValue,
        animationTime,
        (...args) => valueMixerRef.current(...args)
    ));

    // TODO: targetValue in the class should be updated immediately, not when React calls useEffect next time!
    useEffect(
        () => manager.update(targetValue, animationTime),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(targetValue), animationTime]
    );

    return manager.animatedValue;
}
