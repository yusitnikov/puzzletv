import {createContext, FC, useContext} from "react";
import {
    getTransformedRectAverageAngle,
    getTransformedRectAverageSize,
    getTransformedRectMatrix,
    TransformedRect
} from "../types/layout/Rect";

// region Scale
const TransformScaleContext = createContext(1);

export const useTransformScale = () => useContext(TransformScaleContext);

export const TransformScaleContextProvider: FC<{scale: number}> = ({scale, children}) => {
    const prevScale = useTransformScale();

    return <TransformScaleContext.Provider value={prevScale * scale}>
        {children}
    </TransformScaleContext.Provider>;
};
// endregion

// region Angle
const TransformAngleContext = createContext(0);

export const useTransformAngle = () => useContext(TransformAngleContext);

export const TransformAngleContextProvider: FC<{angle: number}> = ({angle, children}) => {
    const prevAngle = useTransformAngle();

    return <TransformAngleContext.Provider value={prevAngle + angle}>
        {children}
    </TransformAngleContext.Provider>;
};
// endregion

export const TransformedRectGraphics: FC<{rect: TransformedRect}> = ({rect, children}) => {
    return <g transform={getTransformedRectMatrix(rect)}>
        <TransformScaleContextProvider scale={getTransformedRectAverageSize(rect)}>
            <TransformAngleContextProvider angle={getTransformedRectAverageAngle(rect)}>
                {children}
            </TransformAngleContextProvider>
        </TransformScaleContextProvider>
    </g>;
};
