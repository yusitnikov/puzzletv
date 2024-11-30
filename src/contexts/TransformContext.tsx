import { createContext, PropsWithChildren, useContext } from "react";
import {
    getTransformedRectAverageAngle,
    getTransformedRectAverageSize,
    getTransformedRectMatrix,
    TransformedRect,
} from "../types/layout/Rect";
import { observer } from "mobx-react-lite";
import { profiler } from "../utils/profiler";
import { PuzzleContext } from "../types/sudoku/PuzzleContext";

// region Scale
const TransformScaleContext = createContext(1);

export const useTransformScale = () => useContext(TransformScaleContext);

export const TransformScaleContextProvider = observer(function TransformScaleContextProviderFc({
    scale,
    children,
}: PropsWithChildren<{ scale: number }>) {
    profiler.trace();

    const prevScale = useTransformScale();

    return <TransformScaleContext.Provider value={prevScale * scale}>{children}</TransformScaleContext.Provider>;
});
// endregion

// region Angle
const TransformAngleContext = createContext(0);

export const useTransformAngle = () => useContext(TransformAngleContext);

export const useCompensationAngle = ({
    puzzle: {
        typeManager: { compensateConstraintDigitAngle },
    },
}: PuzzleContext<any>) => {
    const angle = useTransformAngle();

    return compensateConstraintDigitAngle ? angle : 0;
};

export const TransformAngleContextProvider = observer(function TransformAngleContextProviderFc({
    angle,
    children,
}: PropsWithChildren<{ angle: number }>) {
    profiler.trace();

    const prevAngle = useTransformAngle();

    return <TransformAngleContext.Provider value={prevAngle + angle}>{children}</TransformAngleContext.Provider>;
});
// endregion

export const TransformedRectGraphics = observer(function TransformedRectGraphics({
    rect,
    children,
}: PropsWithChildren<{ rect: TransformedRect }>) {
    profiler.trace();

    return (
        <g transform={getTransformedRectMatrix(rect)}>
            <TransformScaleContextProvider scale={getTransformedRectAverageSize(rect)}>
                <TransformAngleContextProvider angle={getTransformedRectAverageAngle(rect)}>
                    {children}
                </TransformAngleContextProvider>
            </TransformScaleContextProvider>
        </g>
    );
});
