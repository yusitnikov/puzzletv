import React, {ReactNode} from "react";
import {FieldRect} from "./FieldRect";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {GridRegion} from "../../../types/sudoku/GridRegion";

interface FieldRegionsWithSameCoordsTransformationProps<CellType, ExType, ProcessedExType> {
    context: PuzzleContext<CellType, ExType, ProcessedExType>;
    children: ReactNode | ((region?: GridRegion) => ReactNode);
}

export const FieldRegionsWithSameCoordsTransformation = <CellType, ExType, ProcessedExType>(
    {
        context,
        children,
    }: FieldRegionsWithSameCoordsTransformationProps<CellType, ExType, ProcessedExType>
) => {
    const {
        puzzle: {
            typeManager: {getRegionsWithSameCoordsTransformation},
        },
    } = context;

    const regionsWithSameCoordsTransformation = getRegionsWithSameCoordsTransformation?.(context);

    return <>
        {regionsWithSameCoordsTransformation?.map((region, index) => <FieldRect
            key={`items-region-${index}`}
            context={context}
            clip={true}
            {...region}
        >
            <AutoSvg
                left={-region.left}
                top={-region.top}
                width={1}
                height={1}
            >
                {typeof children === "function" ? children(region) : children}
            </AutoSvg>
        </FieldRect>)}

        {!regionsWithSameCoordsTransformation && <FieldRect
            context={context}
            top={0}
            left={0}
        >
            {typeof children === "function" ? children() : children}
        </FieldRect>}
    </>;
};
