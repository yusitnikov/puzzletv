import { useEffect, useState } from "react";
import { rafTime } from "./useRaf";
import { comparer, computed, IReactionDisposer, makeAutoObservable, reaction } from "mobx";
import { profiler } from "../utils/profiler";
import { Position } from "../types/layout/Position";

export type AnimatedValueMixer<T> = (a: T, b: T, coeff: number) => T;

export const mixAnimatedValue: AnimatedValueMixer<number> = (a, b, coeff) =>
    a + (b - a) * Math.max(0, Math.min(1, coeff));

export const mixAnimatedBool: AnimatedValueMixer<boolean> = (a, b, coeff) =>
    mixAnimatedValue(a ? 1 : 0, b ? 1 : 0, coeff) === 1;

export const mixAnimatedPosition: AnimatedValueMixer<Position> = (a, b, coeff) => ({
    top: mixAnimatedValue(a.top, b.top, coeff),
    left: mixAnimatedValue(a.left, b.left, coeff),
});

export const mixAnimatedArray = <T>(
    a: T[],
    b: T[],
    coeff: number,
    mixer: AnimatedValueMixer<T> = mixAnimatedValue as any,
) => b.map((bi, index) => mixer(a[index], bi, coeff));

export class AnimatedValue<T> {
    private startValue: T;
    private targetValue: T;
    private startTime: number;
    private animationTime: number;

    readonly dispose?: IReactionDisposer;

    constructor(
        targetValueFn: () => T,
        animationTimeFn: () => number,
        private valueMixer: AnimatedValueMixer<T> = mixAnimatedValue as any,
    ) {
        makeAutoObservable<this, "valueMixer">(this, {
            valueMixer: false,
            finalValue: false,
            dispose: false,
            animatedValue: computed({ equals: comparer.structural }),
        });

        const targetValue = targetValueFn();

        this.startValue = targetValue;
        this.targetValue = targetValue;
        this.startTime = rafTime();
        this.animationTime = animationTimeFn();

        this.dispose = reaction(
            () => ({
                targetValue: targetValueFn(),
                animationTime: animationTimeFn(),
            }),
            ({ targetValue, animationTime }) => {
                this.update(targetValue, animationTime);
            },
            { equals: comparer.structural },
        );
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

export function useAnimatedValue(targetValueFn: () => number, animationTimeFn: () => number): number;
export function useAnimatedValue<T>(
    targetValueFn: () => T,
    animationTimeFn: () => number,
    valueMixer: AnimatedValueMixer<T>,
): T;
export function useAnimatedValue<T>(
    targetValueFn: () => T,
    animationTimeFn: () => number,
    valueMixer: AnimatedValueMixer<T> = mixAnimatedValue as any,
): T {
    const [manager] = useState(() => new AnimatedValue<T>(targetValueFn, animationTimeFn, valueMixer));

    useEffect(() => {
        return () => {
            manager.dispose?.();
        };
    }, [manager]);

    return manager.animatedValue;
}
