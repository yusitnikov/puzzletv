import {createContext, FC, useContext} from "react";
import {getTransformedRectAverageSize, getTransformedRectMatrix, TransformedRect} from "../types/layout/Rect";

const TransformScaleContext = createContext(1);

export const useTransformScale = () => useContext(TransformScaleContext);

export const TransformScaleContextProvider: FC<{scale: number}> = ({scale, children}) => {
    const prevScale = useTransformScale();

    return <TransformScaleContext.Provider value={prevScale * scale}>
        {children}
    </TransformScaleContext.Provider>;
};

export const TransformedRectGraphics: FC<{rect: TransformedRect}> = ({rect, children}) => {
    return <g transform={getTransformedRectMatrix(rect)}>
        <TransformScaleContextProvider scale={getTransformedRectAverageSize(rect)}>
            {children}
        </TransformScaleContextProvider>
    </g>;
};
