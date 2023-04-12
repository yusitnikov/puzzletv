import React, {PropsWithChildren} from "react";
import {FieldRect} from "./FieldRect";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";

interface FieldRegionsWithSameCoordsTransformationProps<CellType, ExType, ProcessedExType> {
    context: PuzzleContext<CellType, ExType, ProcessedExType>;
}

export const FieldRegionsWithSameCoordsTransformation = <CellType, ExType, ProcessedExType>(
    {
        context,
        children,
    }: PropsWithChildren<FieldRegionsWithSameCoordsTransformationProps<CellType, ExType, ProcessedExType>>
) => {
    const {
        puzzle: {
            typeManager: {getRegionsWithSameCoordsTransformation},
        },
    } = context;

    const regionsWithSameCoordsTransformation = getRegionsWithSameCoordsTransformation?.(context);

    return <>
        {regionsWithSameCoordsTransformation?.map((rect, index) => <FieldRect
            key={`items-region-${index}`}
            context={context}
            clip={true}
            {...rect}
        >
            <AutoSvg
                left={-rect.left}
                top={-rect.top}
                width={1}
                height={1}
            >
                {children}
            </AutoSvg>
        </FieldRect>)}

        {!regionsWithSameCoordsTransformation && <FieldRect
            context={context}
            top={0}
            left={0}
        >
            {children}
        </FieldRect>}
    </>;
};
